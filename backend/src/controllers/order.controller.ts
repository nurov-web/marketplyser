import { Response } from "express";
import { z } from "zod";
import { DeliveryMethod, PaymentMethod, OrderStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { notify } from "../lib/notify";
import { finalPrice, routeParam, toNum } from "../utils/helpers";
import { couponDiscount, findValidCoupon } from "./coupon.controller";
import { geocodeCity, jitter } from "../lib/geo";

type Tx = typeof prisma;

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(3, "Номи пурраро нависед"),
  phone: z.string().trim().min(7, "Рақами телефон нодуруст аст"),
  city: z.string().trim().min(2, "Шаҳрро нависед"),
  address: z.string().trim().min(5, "Суроғаро пурра нависед"),
  deliveryMethod: z.nativeEnum(DeliveryMethod).default("STANDARD"),
  paymentMethod: z.nativeEnum(PaymentMethod).default("COD"),
  saveAddress: z.boolean().optional(),
  couponCode: z.string().optional(),
});

export async function placeOrder(req: AuthedRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(401).json({ message: "Корбар ёфт нашуд" });
  if (user.accountStatus === "RESTRICTED") {
    return res.status(403).json({ message: "Фармоиш муваққатан маҳдуд аст" });
  }

  const data = req.body as z.infer<typeof checkoutSchema>;
  const cart = await prisma.cartItem.findMany({
    where: { userId: req.user!.id },
    include: { product: true },
  });
  if (!cart.length) return res.status(400).json({ message: "Сабад холӣ аст" });

  for (const item of cart) {
    if (item.product.moderationStatus !== "APPROVED" || item.product.stock < item.quantity) {
      return res.status(400).json({
        message: `Маҳсулот ${item.product.name} дастрас нест ё захира кам аст`,
      });
    }
  }

  const deliveryFee = data.deliveryMethod === "EXPRESS" ? 15 : data.deliveryMethod === "PICKUP" ? 0 : 5;
  const lines = cart.map((i) => {
    const unit = finalPrice(toNum(i.product.price), toNum(i.product.discount));
    return { ...i, unit, line: unit * i.quantity };
  });
  const subtotal = lines.reduce((s, i) => s + i.line, 0);
  let discount = 0;
  let couponCode: string | null = null;
  let couponId: string | null = null;
  if (data.couponCode) {
    const found = await findValidCoupon(data.couponCode, req.user!.id);
    if (!found.coupon) return res.status(400).json({ message: found.error });
    discount = couponDiscount(found.coupon, subtotal);
    if (discount <= 0) {
      return res.status(400).json({ message: "Ҳадди ақал барои купон нокифоя аст" });
    }
    couponCode = found.coupon.code;
    couponId = found.coupon.id;
  }
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const paymentStatus =
    data.paymentMethod === "COD" ? "PENDING" : "PAID";

  const geo = geocodeCity(data.city);
  const point = jitter(`${req.user!.id}-${Date.now()}`, geo.lat, geo.lng);

  const order = await prisma.$transaction(async (interactive) => {
    const tx = interactive as Tx;
    const last = await tx.order.aggregate({ _max: { number: true } });
    const nextNumber = (last._max.number || 10000) + 1;
    const created = await tx.order.create({
      data: {
        number: nextNumber,
        userId: req.user!.id,
        fullName: data.fullName,
        phone: data.phone,
        city: data.city,
        address: data.address,
        deliveryMethod: data.deliveryMethod,
        deliveryFee,
        subtotal,
        discount,
        couponCode,
        total,
        status: "PENDING",
        lat: point.lat,
        lng: point.lng,
        items: {
          create: lines.map((i) => ({
            productId: i.productId,
            sellerId: i.product.sellerId,
            name: i.product.name,
            price: i.unit,
            quantity: i.quantity,
            status: "PENDING",
          })),
        },
        payment: {
          create: {
            method: data.paymentMethod,
            status: paymentStatus,
            amount: total,
          },
        },
      },
      include: { items: true, payment: true },
    });

    for (const i of cart) {
      await tx.product.update({
        where: { id: i.productId },
        data: { stock: { decrement: i.quantity } },
      });
    }
    await tx.cartItem.deleteMany({ where: { userId: req.user!.id } });
    if (couponId && couponCode) {
      await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
      await tx.couponUse.create({
        data: { couponId, userId: req.user!.id, orderId: created.id },
      });
    }

    if (data.saveAddress) {
      await tx.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
      await tx.address.create({
        data: {
          userId: req.user!.id,
          fullName: data.fullName,
          phone: data.phone,
          city: data.city,
          address: data.address,
          isDefault: true,
        },
      });
    }
    return created;
  });

  const sellerIds = [...new Set(order.items.map((i: { sellerId: string }) => i.sellerId))] as string[];
  const sellers = await prisma.seller.findMany({
    where: { id: { in: sellerIds } },
    select: { userId: true, shopName: true },
  });
  await Promise.all(
    sellers.map((s) =>
      notify(s.userId, "NEW_ORDER", "Фармоиши нав", `Фармоиш #${order.number} омад.`, {
        orderId: order.id,
      })
    )
  );
  await notify(req.user!.id, "ORDER_PLACED", "Фармоиш қабул шуд", `Фармоиш #${order.number} сабт шуд.`);

  await prisma.crmDeal.create({
    data: {
      title: `Order #${order.number}`,
      amount: order.total,
      stage: "NEW",
      orderId: order.id,
    },
  });
  await prisma.crmLead.create({
    data: {
      title: `Order #${order.number}`,
      name: data.fullName,
      phone: data.phone,
      status: "CONVERTED",
      source: "ORDER",
    },
  });

  return res.status(201).json(order);
}

export async function listOrders(req: AuthedRequest, res: Response) {
  const items = await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: {
      items: { include: { product: { include: { images: { take: 1 } } } } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ items });
}

export async function getOrder(req: AuthedRequest, res: Response) {
  const order = await prisma.order.findFirst({
    where: { id: routeParam(req.params.id), userId: req.user!.id },
    include: {
      items: { include: { product: { include: { images: { take: 1 } } }, seller: true } },
      payment: true,
    },
  });
  if (!order) return res.status(404).json({ message: "Фармоиш ёфт нашуд" });
  return res.json(order);
}

export async function cancelOrder(req: AuthedRequest, res: Response) {
  const reason = String(req.body.reason || "").trim();
  if (reason.length < 5) {
    return res.status(400).json({ message: "Сабаби бекоркунӣ ҳатмӣ аст" });
  }
  const order = await prisma.order.findFirst({
    where: { id: routeParam(req.params.id), userId: req.user!.id },
    include: { items: true },
  });
  if (!order) return res.status(404).json({ message: "Фармоиш ёфт нашуд" });
  if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)) {
    return res.status(400).json({ message: "Ин фармоишро бекор кардан мумкин нест" });
  }
  await prisma.$transaction(async (interactive) => {
    const tx = interactive as Tx;
    await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", cancelReason: reason },
    });
    await tx.orderItem.updateMany({
      where: { orderId: order.id },
      data: { status: "CANCELLED" },
    });
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  });
  return res.json({ ok: true });
}

const statusFlow: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export async function sellerOrders(req: AuthedRequest, res: Response) {
  const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
  if (!seller) return res.status(403).json({ message: "Seller нест" });
  const items = await prisma.orderItem.findMany({
    where: { sellerId: seller.id },
    include: {
      order: { include: { user: { select: { firstName: true, lastName: true, phone: true } }, payment: true } },
      product: { include: { images: { take: 1 } } },
    },
    orderBy: { order: { createdAt: "desc" } },
  });
  return res.json({ items });
}

export async function updateSellerOrderStatus(req: AuthedRequest, res: Response) {
  const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
  if (!seller) return res.status(403).json({ message: "Seller нест" });
  const status = req.body.status as OrderStatus;
  if (!statusFlow.includes(status) && status !== "CANCELLED") {
    return res.status(400).json({ message: "Статуси нодуруст" });
  }
  if (status === "CANCELLED") {
    const reason = String(req.body.reason || "").trim();
    if (reason.length < 5) {
      return res.status(400).json({ message: "Бекоркунӣ бояд бо сабаб бошад" });
    }
  }
  const item = await prisma.orderItem.findFirst({
    where: { id: routeParam(req.params.id), sellerId: seller.id },
    include: { order: true },
  });
  if (!item) return res.status(404).json({ message: "Фармоиш ёфт нашуд" });

  await prisma.orderItem.update({ where: { id: item.id }, data: { status } });
  const siblings = await prisma.orderItem.findMany({ where: { orderId: item.orderId } });
  const allSame = siblings.every((s) => (s.id === item.id ? status : s.status) === status);
  if (allSame) {
    await prisma.order.update({
      where: { id: item.orderId },
      data: {
        status,
        cancelReason: status === "CANCELLED" ? req.body.reason : undefined,
      },
    });
  } else if (status === "CONFIRMED" && item.order.status === "PENDING") {
    await prisma.order.update({ where: { id: item.orderId }, data: { status: "CONFIRMED" } });
  }

  if (status === "DELIVERED") {
    await prisma.seller.update({
      where: { id: seller.id },
      data: { balance: { increment: Number(item.price) * item.quantity } },
    });
  }

  const titles: Record<string, string> = {
    CONFIRMED: "Фармоиш тасдиқ шуд",
    PROCESSING: "Фармоиш коркард мешавад",
    SHIPPED: "Фармоиш фиристода шуд",
    DELIVERED: "Фармоиш расид",
    CANCELLED: "Фармоиш бекор шуд",
  };
  if (titles[status]) {
    await notify(item.order.userId, `ORDER_${status}`, titles[status], `Фармоиш #${item.order.number}: ${titles[status]}`);
  }
  return res.json({ ok: true });
}

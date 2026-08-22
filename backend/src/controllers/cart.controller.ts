import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { finalPrice, routeParam, toNum } from "../utils/helpers";

export async function getCart(req: AuthedRequest, res: Response) {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.id },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          seller: { select: { shopName: true, status: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = items
    .filter((i) => i.product.moderationStatus === "APPROVED")
    .map((i) => {
      const price = toNum(i.product.price);
      const discount = toNum(i.product.discount);
      const unit = finalPrice(price, discount);
      return {
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        product: i.product,
        unitPrice: unit,
        lineTotal: unit * i.quantity,
      };
    });

  const subtotal = mapped.reduce((s, i) => s + i.lineTotal, 0);
  return res.json({ items: mapped, subtotal, delivery: 5, total: subtotal + 5 });
}

export const cartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(99).default(1),
});

export async function addToCart(req: AuthedRequest, res: Response) {
  const { productId, quantity } = req.body as z.infer<typeof cartSchema>;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.moderationStatus !== "APPROVED") {
    return res.status(404).json({ message: "Маҳсулот дастрас нест" });
  }
  if (product.stock < quantity) {
    return res.status(400).json({ message: "Миқдори кофӣ нест" });
  }

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: req.user!.id, productId } },
    create: { userId: req.user!.id, productId, quantity },
    update: { quantity: { increment: quantity } },
  });
  return res.status(201).json(item);
}

export async function updateCartItem(req: AuthedRequest, res: Response) {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    await prisma.cartItem.deleteMany({ where: { id: routeParam(req.params.id), userId: req.user!.id } });
    return res.json({ ok: true });
  }
  const item = await prisma.cartItem.updateMany({
    where: { id: routeParam(req.params.id), userId: req.user!.id },
    data: { quantity },
  });
  return res.json(item);
}

export async function removeCartItem(req: AuthedRequest, res: Response) {
  await prisma.cartItem.deleteMany({ where: { id: routeParam(req.params.id), userId: req.user!.id } });
  return res.json({ ok: true });
}

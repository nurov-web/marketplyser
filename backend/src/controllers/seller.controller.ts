import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { toNum } from "../utils/helpers";
import { serializeProduct } from "./product.controller";

export const sellerApplySchema = z.object({
  shopName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
  address: z.string().min(3),
  description: z.string().min(10),
  logo: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

export async function applySeller(req: AuthedRequest, res: Response) {
  return res.status(403).json({ message: "Танҳо Admin мол ва категория илова мекунад" });
}

export async function getSellerMe(req: AuthedRequest, res: Response) {
  const seller = await prisma.seller.findUnique({
    where: { userId: req.user!.id },
    include: { _count: { select: { products: true, orderItems: true } } },
  });
  if (!seller) return res.status(404).json({ message: "Seller профил нест" });
  return res.json(seller);
}

export async function updateSellerProfile(req: AuthedRequest, res: Response) {
  const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
  if (!seller) return res.status(404).json({ message: "Seller нест" });
  const data = sellerApplySchema.partial().parse(req.body);
  const updated = await prisma.seller.update({ where: { id: seller.id }, data });
  return res.json(updated);
}

export async function sellerDashboard(req: AuthedRequest, res: Response) {
  const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
  if (!seller) return res.status(403).json({ message: "Seller нест" });

  const [products, orderItems, customers] = await Promise.all([
    prisma.product.count({ where: { sellerId: seller.id } }),
    prisma.orderItem.findMany({
      where: { sellerId: seller.id, status: { not: "CANCELLED" } },
      include: { order: true },
    }),
    prisma.orderItem.findMany({
      where: { sellerId: seller.id },
      select: { order: { select: { userId: true } } },
      distinct: ["orderId"],
    }),
  ]);

  const revenue = orderItems
    .filter((i) => i.status === "DELIVERED")
    .reduce((s, i) => s + toNum(i.price) * i.quantity, 0);

  const byDay = new Map<string, { sales: number; orders: number }>();
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const key = date.toISOString().slice(0, 10);
    byDay.set(key, { sales: 0, orders: 0 });
  }
  for (const item of orderItems) {
    const key = item.order.createdAt.toISOString().slice(0, 10);
    const row = byDay.get(key);
    if (row) {
      row.sales += toNum(item.price) * item.quantity;
      row.orders += 1;
    }
  }

  const uniqueCustomers = new Set(customers.map((c) => c.order.userId)).size;

  return res.json({
    totalSales: revenue,
    orders: orderItems.length,
    products,
    customers: uniqueCustomers,
    balance: toNum(seller.balance),
    chart: [...byDay.entries()].map(([date, v]) => ({ date, ...v })),
  });
}

export async function publicSellers(_req: AuthedRequest, res: Response) {
  const items = await prisma.seller.findMany({
    where: { status: "APPROVED" },
    select: { id: true, shopName: true, logo: true, description: true, address: true },
  });
  return res.json({ items });
}

export async function publicShop(req: AuthedRequest, res: Response) {
  const id = String(req.params.id || "");
  const seller = await prisma.seller.findFirst({
    where: { id, status: "APPROVED" },
    select: {
      id: true,
      shopName: true,
      logo: true,
      description: true,
      address: true,
      createdAt: true,
    },
  });
  if (!seller) return res.status(404).json({ message: "Дӯкон ёфт нашуд" });
  const products = await prisma.product.findMany({
    where: { sellerId: seller.id, moderationStatus: "APPROVED", stock: { gt: 0 } },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ seller, items: products.map(serializeProduct) });
}

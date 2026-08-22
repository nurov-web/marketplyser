import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { serializeProduct } from "./product.controller";

export async function listFavorites(req: AuthedRequest, res: Response) {
  const items = await prisma.favorite.findMany({
    where: { userId: req.user!.id },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          seller: { select: { shopName: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json({
    items: items
      .filter((i) => i.product.moderationStatus === "APPROVED")
      .map((i) => ({ ...i, product: serializeProduct(i.product) })),
  });
}

export async function toggleFavorite(req: AuthedRequest, res: Response) {
  const productId = String(req.body.productId || req.params.productId);
  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: req.user!.id, productId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return res.json({ favorited: false });
  }
  await prisma.favorite.create({ data: { userId: req.user!.id, productId } });
  return res.json({ favorited: true });
}

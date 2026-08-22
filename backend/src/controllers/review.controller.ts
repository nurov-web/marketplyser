import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { routeParam } from "../utils/helpers";

export const reviewSchema = z.object({
  productId: z.string(),
  orderId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(2000),
});

export async function createReview(req: AuthedRequest, res: Response) {
  const data = req.body as z.infer<typeof reviewSchema>;
  const order = await prisma.order.findFirst({
    where: { id: data.orderId, userId: req.user!.id, status: "DELIVERED" },
    include: { items: true },
  });
  if (!order) {
    return res.status(400).json({ message: "Review танҳо пас аз гирифтани маҳсулот иҷозат аст" });
  }
  const bought = order.items.some((i) => i.productId === data.productId);
  if (!bought) {
    return res.status(400).json({ message: "Шумо ин маҳсулотро нахаридаед" });
  }

  const existing = await prisma.review.findUnique({
    where: {
      userId_productId_orderId: {
        userId: req.user!.id,
        productId: data.productId,
        orderId: data.orderId,
      },
    },
  });
  if (existing) return res.status(409).json({ message: "Шумо аллакай review гузоштед" });

  const review = await prisma.review.create({
    data: {
      userId: req.user!.id,
      productId: data.productId,
      orderId: data.orderId,
      rating: data.rating,
      comment: data.comment,
    },
    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
  });
  return res.status(201).json(review);
}

export async function listProductReviews(req: AuthedRequest, res: Response) {
  const items = await prisma.review.findMany({
    where: { productId: routeParam(req.params.productId) },
    include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ items });
}

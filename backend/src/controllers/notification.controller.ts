import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { routeParam } from "../utils/helpers";

export async function listNotifications(req: AuthedRequest, res: Response) {
  const items = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unread = await prisma.notification.count({
    where: { userId: req.user!.id, read: false },
  });
  return res.json({ items, unread });
}

export async function markRead(req: AuthedRequest, res: Response) {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, id: routeParam(req.params.id) },
    data: { read: true },
  });
  return res.json({ ok: true });
}

export async function markAllRead(req: AuthedRequest, res: Response) {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id },
    data: { read: true },
  });
  return res.json({ ok: true });
}

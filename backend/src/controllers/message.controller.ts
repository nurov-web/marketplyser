import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { notify } from "../lib/notify";
import { getIo } from "../socket";
import { routeParam } from "../utils/helpers";

export const messageSchema = z.object({
  sellerId: z.string().optional(),
  conversationId: z.string().optional(),
  productId: z.string().optional().nullable(),
  content: z.string().min(1).max(2000),
});

const banned = ["http://", "https://", "telegram", "whatsapp"];

export async function listConversations(req: AuthedRequest, res: Response) {
  const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
  const items = await prisma.conversation.findMany({
    where: seller
      ? { OR: [{ userId: req.user!.id }, { sellerId: seller.id }] }
      : { userId: req.user!.id },
    include: {
      user: { select: { firstName: true, lastName: true, avatar: true } },
      seller: { select: { shopName: true, logo: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  return res.json({ items });
}

export async function getMessages(req: AuthedRequest, res: Response) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: routeParam(req.params.id) },
    include: {
      messages: {
        include: { sender: { select: { firstName: true, lastName: true, avatar: true } } },
        orderBy: { createdAt: "asc" },
      },
      user: { select: { id: true, firstName: true, lastName: true } },
      seller: { include: { user: { select: { id: true } } } },
    },
  });
  if (!conversation) return res.status(404).json({ message: "Чат ёфт нашуд" });
  const allowed =
    conversation.userId === req.user!.id ||
    conversation.seller.userId === req.user!.id ||
    req.user!.role === "ADMIN";
  if (!allowed) return res.status(403).json({ message: "Дастрасӣ манъ аст" });
  return res.json(conversation);
}

export async function sendMessage(req: AuthedRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (user?.accountStatus === "RESTRICTED") {
    return res.status(403).json({ message: "Чат муваққатан маҳдуд аст" });
  }
  const data = req.body as z.infer<typeof messageSchema>;
  const lower = data.content.toLowerCase();
  if (banned.some((w) => lower.includes(w))) {
    return res.status(400).json({ message: "Фиристодани пайвандҳои беруна манъ аст" });
  }

  let conversationId = data.conversationId;
  if (!conversationId) {
    if (!data.sellerId) return res.status(400).json({ message: "sellerId лозим аст" });
    const conv = await prisma.conversation.upsert({
      where: {
        userId_sellerId_productId: {
          userId: req.user!.id,
          sellerId: data.sellerId,
          productId: data.productId || "",
        },
      },
      create: {
        userId: req.user!.id,
        sellerId: data.sellerId,
        productId: data.productId || "",
      },
      update: {},
    });
    conversationId = conv.id;
  }
  if (!conversationId) return res.status(400).json({ message: "conversationId лозим аст" });

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { seller: true },
  });
  if (!conversation) return res.status(404).json({ message: "Чат ёфт нашуд" });

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: req.user!.id,
      content: data.content,
    },
    include: { sender: { select: { firstName: true, lastName: true, avatar: true } } },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const recipientId =
    req.user!.id === conversation.userId ? conversation.seller.userId : conversation.userId;
  await notify(recipientId, "NEW_MESSAGE", "Паёми нав", data.content.slice(0, 80), {
    conversationId,
  });

  getIo()?.to(`user:${recipientId}`).emit("chat:message", { conversationId, message });
  getIo()?.to(`conv:${conversationId}`).emit("chat:message", { conversationId, message });

  return res.status(201).json({ conversationId, message });
}

export async function adminConversations(_req: AuthedRequest, res: Response) {
  const items = await prisma.conversation.findMany({
    include: {
      user: { select: { firstName: true, lastName: true } },
      seller: { select: { shopName: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return res.json({ items });
}

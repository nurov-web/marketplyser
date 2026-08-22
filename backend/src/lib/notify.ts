import { prisma } from "./prisma";

export async function notify(userId: string, type: string, title: string, body: string, data?: object) {
  return prisma.notification.create({
    data: { userId, type, title, body, data: data ?? undefined },
  });
}

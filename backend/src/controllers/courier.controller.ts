import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { DUSHANBE, geocodeCity, haversineKm, jitter } from "../lib/geo";
import { notify } from "../lib/notify";
import { routeParam } from "../utils/helpers";

export const courierApplySchema = z.object({
  fullName: z.string().trim().min(3, "Номро нависед"),
  phone: z.string().trim().min(7, "Телефон нодуруст аст"),
  city: z.string().trim().min(2, "Шаҳрро нависед"),
  vehicle: z.string().trim().min(2, "Нақлиётро интихоб кунед"),
  message: z.string().trim().max(500).optional(),
});

export async function myApplication(req: AuthedRequest, res: Response) {
  const row = await prisma.courierApplication.findUnique({ where: { userId: req.user!.id } });
  return res.json({ application: row });
}

export async function applyCourier(req: AuthedRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(401).json({ message: "Корбар ёфт нашуд" });
  if (user.role === "COURIER") return res.status(400).json({ message: "Шумо аллакай доставчик ҳастед" });
  if (user.role === "ADMIN") return res.status(400).json({ message: "Admin заявка намедиҳад" });

  const data = req.body as z.infer<typeof courierApplySchema>;
  const existing = await prisma.courierApplication.findUnique({ where: { userId: user.id } });
  if (existing?.status === "PENDING") {
    return res.status(400).json({ message: "Заявкаи шумо аллакай дар интизори Admin аст" });
  }
  if (existing?.status === "APPROVED") {
    return res.status(400).json({ message: "Заявка қабул шудааст" });
  }

  const row = existing
    ? await prisma.courierApplication.update({
        where: { id: existing.id },
        data: {
          fullName: data.fullName,
          phone: data.phone,
          city: data.city,
          vehicle: data.vehicle,
          message: data.message || "",
          status: "PENDING",
          rejectReason: null,
          reviewedAt: null,
        },
      })
    : await prisma.courierApplication.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          phone: data.phone,
          city: data.city,
          vehicle: data.vehicle,
          message: data.message || "",
        },
      });

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await Promise.all(
    admins.map((a: { id: string }) =>
      notify(a.id, "COURIER_APPLY", "Заявкаи доставчик", `${data.fullName} мехоҳад доставчик шавад.`, {
        applicationId: row.id,
      })
    )
  );

  return res.status(201).json({ application: row });
}

export async function adminCourierApps(_req: AuthedRequest, res: Response) {
  const items = await prisma.courierApplication.findMany({
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return res.json({ items });
}

export async function adminCourierAct(req: AuthedRequest, res: Response) {
  const action = String(req.body.action || "");
  const reason = String(req.body.reason || "").trim();
  const row = await prisma.courierApplication.findUnique({ where: { id: routeParam(req.params.id) } });
  if (!row) return res.status(404).json({ message: "Заявка ёфт нашуд" });

  if (action === "approve") {
    await prisma.$transaction([
      prisma.courierApplication.update({
        where: { id: row.id },
        data: { status: "APPROVED", reviewedAt: new Date(), rejectReason: null },
      }),
      prisma.user.update({ where: { id: row.userId }, data: { role: "COURIER" } }),
    ]);
    await notify(row.userId, "COURIER_APPROVED", "Заявка қабул шуд", "Шумо ҳоло доставчик ҳастед. Панел кушода шуд.");
    return res.json({ ok: true, status: "APPROVED" });
  }

  if (action === "reject") {
    await prisma.courierApplication.update({
      where: { id: row.id },
      data: { status: "REJECTED", reviewedAt: new Date(), rejectReason: reason || "Рад шуд" },
    });
    await prisma.user.updateMany({ where: { id: row.userId, role: "COURIER" }, data: { role: "USER" } });
    await notify(row.userId, "COURIER_REJECTED", "Заявка рад шуд", reason || "Admin заявкаро қабул накард.");
    return res.json({ ok: true, status: "REJECTED" });
  }

  return res.status(400).json({ message: "Амали нодуруст" });
}

function pointOf(order: { id: string; lat: number | null; lng: number | null; city: string }) {
  if (order.lat != null && order.lng != null) return { lat: order.lat, lng: order.lng };
  const g = geocodeCity(order.city);
  return jitter(order.id, g.lat, g.lng);
}

export async function listLoads(req: AuthedRequest, res: Response) {
  const origin = {
    lat: Number(req.query.lat) || DUSHANBE.lat,
    lng: Number(req.query.lng) || DUSHANBE.lng,
  };

  const items = await prisma.order.findMany({
    where: {
      deliveryMethod: { not: "PICKUP" },
      status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] },
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { take: 1 },
              category: { select: { name: true, slug: true } },
            },
          },
        },
      },
      payment: true,
      user: { select: { firstName: true, lastName: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  const loads = items
    .map((order: (typeof items)[number]) => {
      const point = pointOf(order);
      return {
        ...order,
        lat: point.lat,
        lng: point.lng,
        km: haversineKm(origin, point),
      };
    })
    .sort((a: { km: number }, b: { km: number }) => a.km - b.km);

  return res.json({ origin, items: loads });
}

export async function getLoad(req: AuthedRequest, res: Response) {
  const order = await prisma.order.findFirst({
    where: {
      id: routeParam(req.params.id),
      deliveryMethod: { not: "PICKUP" },
    },
    include: {
      items: {
        include: {
          product: { include: { images: { take: 1 }, category: { select: { name: true, slug: true } } } },
          seller: true,
        },
      },
      payment: true,
      user: { select: { firstName: true, lastName: true, phone: true, email: true } },
    },
  });
  if (!order) return res.status(404).json({ message: "Бор ёфт нашуд" });
  const point = pointOf(order);
  return res.json({ ...order, lat: point.lat, lng: point.lng });
}

export async function updateLoad(req: AuthedRequest, res: Response) {
  const action = String(req.body.action || "");
  const order = await prisma.order.findFirst({
    where: { id: routeParam(req.params.id), deliveryMethod: { not: "PICKUP" } },
    include: { items: true },
  });
  if (!order) return res.status(404).json({ message: "Бор ёфт нашуд" });

  if (action === "pickup") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "SHIPPED", courierId: req.user!.id },
    });
    await prisma.orderItem.updateMany({ where: { orderId: order.id }, data: { status: "SHIPPED" } });
    await notify(order.userId, "ORDER_SHIPPED", "Фармоиш фиристода шуд", `Фармоиш #${order.number} дар роҳ аст.`);
    return res.json({ ok: true, status: "SHIPPED" });
  }

  if (action === "deliver") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "DELIVERED", courierId: req.user!.id },
    });
    await prisma.orderItem.updateMany({ where: { orderId: order.id }, data: { status: "DELIVERED" } });
    await notify(order.userId, "ORDER_DELIVERED", "Фармоиш расид", `Фармоиш #${order.number} расонида шуд.`);
    return res.json({ ok: true, status: "DELIVERED" });
  }

  return res.status(400).json({ message: "Амали нодуруст" });
}

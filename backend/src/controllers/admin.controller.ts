import { Response } from "express";
import { AccountStatus, PenaltyType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { notify } from "../lib/notify";
import { publicUser, routeParam } from "../utils/helpers";

export async function adminDashboard(_req: AuthedRequest, res: Response) {
  const [users, sellers, products, orders, pendingSellers, pendingProducts] = await Promise.all([
    prisma.user.count(),
    prisma.seller.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.seller.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { moderationStatus: "PENDING" } }),
  ]);
  const recentOrders = await prisma.order.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { firstName: true, lastName: true } } },
  });
  return res.json({
    users,
    sellers,
    products,
    orders,
    pendingSellers,
    pendingProducts,
    recentOrders,
  });
}

export async function adminUsers(req: AuthedRequest, res: Response) {
  const q = String(req.query.q || "");
  const items = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q } },
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { phone: { contains: q } },
          ],
        }
      : undefined,
    include: { seller: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return res.json({ items: items.map((u) => ({ ...publicUser(u), seller: u.seller })) });
}

export async function adminUserAction(req: AuthedRequest, res: Response) {
  const { action, reason } = req.body as { action: string; reason?: string };
  const user = await prisma.user.findUnique({ where: { id: routeParam(req.params.id) } });
  if (!user) return res.status(404).json({ message: "Корбар ёфт нашуд" });
  if (user.role === "ADMIN") return res.status(400).json({ message: "Admin-ро тағйир додан мумкин нест" });

  if (action === "delete") {
    await prisma.user.delete({ where: { id: user.id } });
    return res.json({ ok: true });
  }

  const map: Record<string, AccountStatus> = {
    block: "BANNED",
    unblock: "ACTIVE",
    warn: "WARNED",
    restrict: "RESTRICTED",
    suspend: "SUSPENDED",
  };
  const status = map[action];
  if (!status) return res.status(400).json({ message: "Амали нодуруст" });

  await prisma.user.update({ where: { id: user.id }, data: { accountStatus: status } });
  const penaltyMap: Record<string, PenaltyType> = {
    warn: "WARNING",
    restrict: "TEMPORARY_RESTRICTION",
    suspend: "SUSPENSION",
    block: "PERMANENT_BAN",
  };
  if (penaltyMap[action]) {
    await prisma.moderationLog.create({
      data: {
        targetUserId: user.id,
        adminId: req.user!.id,
        type: penaltyMap[action],
        reason: reason || action,
        expiresAt: action === "restrict" ? new Date(Date.now() + 7 * 86400000) : null,
      },
    });
  }
  await notify(user.id, "ACCOUNT_STATUS", "Ҳолати аккаунт", `Ҳолат: ${status}. ${reason || ""}`);
  return res.json({ ok: true, accountStatus: status });
}

export async function adminSellers(req: AuthedRequest, res: Response) {
  const status = req.query.status ? String(req.query.status) : undefined;
  const items = await prisma.seller.findMany({
    where: status ? { status: status as never } : undefined,
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, accountStatus: true } },
      _count: { select: { products: true, orderItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ items });
}

export async function adminSellerAction(req: AuthedRequest, res: Response) {
  const { action, reason } = req.body as { action: string; reason?: string };
  const seller = await prisma.seller.findUnique({ where: { id: routeParam(req.params.id) } });
  if (!seller) return res.status(404).json({ message: "Seller ёфт нашуд" });

  const statusMap: Record<string, "APPROVED" | "REJECTED" | "BLOCKED" | "PENDING"> = {
    approve: "APPROVED",
    reject: "REJECTED",
    block: "BLOCKED",
    unblock: "APPROVED",
  };
  const status = statusMap[action];
  if (!status) return res.status(400).json({ message: "Амали нодуруст" });

  await prisma.seller.update({ where: { id: seller.id }, data: { status } });
  if (action === "approve") {
    await prisma.user.update({ where: { id: seller.userId }, data: { role: "SELLER" } });
    await notify(seller.userId, "SELLER_APPROVED", "Дӯкон тасдиқ шуд", "Шумо ҳоло маҳсулот ҷойгир карда метавонед.");
  } else if (action === "reject") {
    await notify(seller.userId, "SELLER_REJECTED", "Дӯкон рад шуд", reason || "Дархост рад шуд.");
  } else if (action === "block") {
    await notify(seller.userId, "SELLER_BLOCKED", "Дӯкон баста шуд", reason || "Қоида вайрон шуд.");
  }
  return res.json({ ok: true, status });
}

export async function adminSellerDetail(req: AuthedRequest, res: Response) {
  const seller = await prisma.seller.findUnique({
    where: { id: routeParam(req.params.id) },
    include: {
      user: true,
      products: { include: { images: { take: 1 } } },
      orderItems: { include: { order: true }, take: 50, orderBy: { order: { createdAt: "desc" } } },
    },
  });
  if (!seller) return res.status(404).json({ message: "Seller ёфт нашуд" });
  const { passwordHash: _, ...user } = seller.user as typeof seller.user & { passwordHash: string };
  return res.json({ ...seller, user });
}

export async function adminProducts(req: AuthedRequest, res: Response) {
  const status = req.query.status ? String(req.query.status) : undefined;
  const q = String(req.query.q || "");
  const where: Prisma.ProductWhereInput = {};
  if (status) where.moderationStatus = status as never;
  if (q) where.name = { contains: q };
  const items = await prisma.product.findMany({
    where,
    include: {
      images: { take: 1 },
      seller: { select: { shopName: true } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return res.json({ items });
}

export async function adminProductAction(req: AuthedRequest, res: Response) {
  const { action, reason } = req.body as { action: string; reason?: string };
  const product = await prisma.product.findUnique({
    where: { id: routeParam(req.params.id) },
    include: { seller: true },
  });
  if (!product) return res.status(404).json({ message: "Маҳсулот ёфт нашуд" });

  if (action === "delete") {
    await prisma.product.delete({ where: { id: product.id } });
    return res.json({ ok: true });
  }

  const map: Record<string, "APPROVED" | "REJECTED" | "HIDDEN" | "PENDING"> = {
    approve: "APPROVED",
    reject: "REJECTED",
    hide: "HIDDEN",
    unhide: "APPROVED",
  };
  const status = map[action];
  if (!status) return res.status(400).json({ message: "Амали нодуруст" });

  await prisma.product.update({
    where: { id: product.id },
    data: { moderationStatus: status, rejectReason: reason },
  });
  if (action === "approve") {
    await notify(product.seller.userId, "PRODUCT_APPROVED", "Маҳсулот тасдиқ шуд", product.name);
  } else if (action === "reject") {
    await notify(product.seller.userId, "PRODUCT_REJECTED", "Маҳсулот рад шуд", reason || product.name);
  }
  return res.json({ ok: true, status });
}

export async function adminUpdateProduct(req: AuthedRequest, res: Response) {
  const { name, description, price, stock } = req.body;
  const product = await prisma.product.update({
    where: { id: routeParam(req.params.id) },
    data: { name, description, price, stock },
  });
  return res.json(product);
}

export async function adminOrders(_req: AuthedRequest, res: Response) {
  const items = await prisma.order.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      items: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return res.json({ items });
}

export async function adminReviews(_req: AuthedRequest, res: Response) {
  const items = await prisma.review.findMany({
    include: {
      user: { select: { firstName: true, lastName: true } },
      product: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return res.json({ items });
}

export async function adminDeleteReview(req: AuthedRequest, res: Response) {
  await prisma.review.delete({ where: { id: routeParam(req.params.id) } });
  return res.json({ ok: true });
}

export async function adminReports(_req: AuthedRequest, res: Response) {
  const items = await prisma.report.findMany({
    include: { reporter: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ items });
}

export async function createReport(req: AuthedRequest, res: Response) {
  const report = await prisma.report.create({
    data: {
      reporterId: req.user!.id,
      targetType: req.body.targetType,
      targetId: req.body.targetId,
      reason: req.body.reason,
    },
  });
  return res.status(201).json(report);
}

export async function adminReportAction(req: AuthedRequest, res: Response) {
  const report = await prisma.report.update({
    where: { id: routeParam(req.params.id) },
    data: { status: req.body.status },
  });
  return res.json(report);
}

export async function adminPenalties(_req: AuthedRequest, res: Response) {
  const items = await prisma.moderationLog.findMany({
    include: {
      targetUser: { select: { firstName: true, lastName: true, email: true } },
      admin: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return res.json({ items });
}

export async function adminSettings(req: AuthedRequest, res: Response) {
  if (req.method === "GET" || !req.body?.items) {
    const items = await prisma.setting.findMany();
    return res.json({ items });
  }
  for (const row of req.body.items as { key: string; value: string }[]) {
    await prisma.setting.upsert({
      where: { key: row.key },
      create: row,
      update: { value: row.value },
    });
  }
  return res.json({ ok: true });
}

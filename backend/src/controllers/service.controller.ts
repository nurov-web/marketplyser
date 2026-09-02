import { Response } from "express";
import type { ServiceProvider } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { pushBitrixLead } from "../lib/bitrix";
import { AuthedRequest } from "../middleware/auth";
import { routeParam, toNum } from "../utils/helpers";

const SERVICE_CITIES = ["Душанбе", "Хуҷанд", "Кӯлоб", "Бохтар"];

export async function listServiceCategories(_req: AuthedRequest, res: Response) {
  const items = await prisma.serviceCategory.findMany({ orderBy: { name: "asc" } });
  return res.json({ items, cities: SERVICE_CITIES });
}

export async function listServiceProviders(req: AuthedRequest, res: Response) {
  const q = String(req.query.q || "").trim();
  const city = String(req.query.city || "").trim();
  const category = String(req.query.category || "").trim();
  const featured = req.query.featured === "true";

  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (city) where.city = city;
  if (featured) where.isFeatured = true;
  if (category) {
    const cat = await prisma.serviceCategory.findFirst({ where: { slug: category } });
    if (cat) where.categoryId = cat.id;
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.serviceProvider.findMany({
    where,
    include: { category: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return res.json({
    items: items.map((p: ServiceProvider) => ({ ...p, priceFrom: toNum(p.priceFrom) })),
  });
}

export async function getServiceProvider(req: AuthedRequest, res: Response) {
  const id = routeParam(req.params.id);
  const row = await prisma.serviceProvider.findFirst({
    where: { id, status: "ACTIVE" },
    include: { category: true },
  });
  if (!row) return res.status(404).json({ message: "Ёфт нашуд" });
  return res.json({ ...row, priceFrom: toNum(row.priceFrom) });
}

export const serviceRequestSchema = z.object({
  providerId: z.string().min(1),
  customerName: z.string().min(2),
  phone: z.string().min(9),
  message: z.string().max(500).optional().default(""),
});

export async function createServiceRequest(req: AuthedRequest, res: Response) {
  const data = serviceRequestSchema.parse(req.body);
  const provider = await prisma.serviceProvider.findFirst({
    where: { id: data.providerId, status: "ACTIVE" },
  });
  if (!provider) return res.status(404).json({ message: "Хизматрасон ёфт нашуд" });

  const crmLead = await prisma.crmLead.create({
    data: {
      title: `Хизмат #${provider.name}`,
      name: data.customerName,
      phone: data.phone,
      source: "SERVICE",
      status: "NEW",
    },
  });

  const bitrixId = await pushBitrixLead({
    title: `Фармоиши хизмат — ${provider.name}`,
    name: data.customerName,
    phone: data.phone,
    comments: [
      `Хизматрасон: ${provider.name} (${provider.phone})`,
      data.message ? `Тавсиф: ${data.message}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  if (bitrixId) {
    await prisma.crmLead.update({ where: { id: crmLead.id }, data: { bitrixId } });
  }

  const request = await prisma.serviceRequest.create({
    data: {
      providerId: provider.id,
      customerName: data.customerName,
      phone: data.phone,
      message: data.message || "",
      crmLeadId: crmLead.id,
      bitrixLeadId: bitrixId,
    },
  });

  return res.status(201).json(request);
}

export async function adminListServiceProviders(_req: AuthedRequest, res: Response) {
  const items = await prisma.serviceProvider.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return res.json({
    items: items.map((p: ServiceProvider) => ({ ...p, priceFrom: toNum(p.priceFrom) })),
  });
}

export async function adminUpdateServiceProvider(req: AuthedRequest, res: Response) {
  const id = routeParam(req.params.id);
  const status = req.body.status as "PENDING" | "ACTIVE" | "BLOCKED" | undefined;
  const isFeatured = req.body.isFeatured;

  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (typeof isFeatured === "boolean") data.isFeatured = isFeatured;

  const row = await prisma.serviceProvider.update({
    where: { id },
    data,
    include: { category: true },
  });
  return res.json({ ...row, priceFrom: toNum(row.priceFrom) });
}

export async function adminListServiceRequests(_req: AuthedRequest, res: Response) {
  const items = await prisma.serviceRequest.findMany({
    include: { provider: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return res.json({ items });
}

export async function adminUpdateServiceRequest(req: AuthedRequest, res: Response) {
  const id = routeParam(req.params.id);
  const status = req.body.status as "NEW" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  const row = await prisma.serviceRequest.update({ where: { id }, data: { status } });
  return res.json(row);
}

export async function sellerServiceRequests(req: AuthedRequest, res: Response) {
  const seller = await prisma.seller.findFirst({ where: { userId: req.user!.id } });
  if (!seller) return res.status(404).json({ message: "Seller нест" });

  const providers = await prisma.serviceProvider.findMany({
    where: { OR: [{ sellerId: seller.id }, { phone: seller.phone }] },
    select: { id: true },
  });
  const ids = providers.map((p: { id: string }) => p.id);
  if (!ids.length) return res.json({ items: [] });

  const items = await prisma.serviceRequest.findMany({
    where: { providerId: { in: ids } },
    include: { provider: true },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ items });
}

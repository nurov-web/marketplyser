import { Response } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { finalPrice, routeParam, slugify, toNum } from "../utils/helpers";

let homeCache: { at: number; data: unknown } | null = null;

export function serializeProduct(p: any) {
  const price = toNum(p.price);
  const discount = toNum(p.discount);
  const reviews = p.reviews as { rating: number }[] | undefined;
  const avg =
    reviews && reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : p._avg?.rating ?? 0;
  const reviewCount = reviews ? reviews.length : p._count?.reviews ?? 0;
  return {
    ...p,
    price,
    discount,
    finalPrice: finalPrice(price, discount),
    rating: Math.round(avg * 10) / 10,
    reviewCount,
    seller: p.seller
      ? {
          id: p.seller.id,
          shopName: p.seller.shopName,
          logo: p.seller.logo,
          status: p.seller.status,
        }
      : undefined,
  };
}

export async function listProducts(req: AuthedRequest, res: Response) {
  const q = String(req.query.q || "");
  const category = String(req.query.category || "");
  const brand = String(req.query.brand || "");
  const seller = String(req.query.seller || "");
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;
  const sort = String(req.query.sort || "new");
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(48, Math.max(1, Number(req.query.limit || 12)));
  const ids = String(req.query.ids || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const section = String(req.query.section || "");

  const where: Prisma.ProductWhereInput = {
    moderationStatus: "APPROVED",
    stock: { gt: 0 },
  };
  if (ids.length) where.id = { in: ids };

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { brand: { contains: q } },
    ];
  }
  if (category) {
    where.OR = undefined;
    where.AND = [
      q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
              { brand: { contains: q } },
            ],
          }
        : {},
      {
        OR: [{ categoryId: category }, { category: { slug: category } }],
      },
    ];
  }
  if (brand) where.brand = { contains: brand };
  if (seller) where.sellerId = seller;
  if (minPrice != null || maxPrice != null) {
    where.price = {};
    if (minPrice != null) where.price.gte = minPrice;
    if (maxPrice != null) where.price.lte = maxPrice;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (section === "new") orderBy = { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        seller: { select: { id: true, shopName: true, logo: true, status: true } },
        reviews: { select: { rating: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  let mapped = items.map(serializeProduct);
  if (minRating) mapped = mapped.filter((p) => p.rating >= minRating);
  if (section === "popular" || section === "best") {
    mapped.sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating);
  }
  if (section === "recommended") {
    mapped.sort((a, b) => b.rating - a.rating);
  }

  return res.json({ items: mapped, total, page, limit });
}

export async function getProduct(req: AuthedRequest, res: Response) {
  const id = routeParam(req.params.id);
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      seller: {
        select: {
          id: true,
          shopName: true,
          logo: true,
          status: true,
          description: true,
        },
      },
      reviews: {
        include: {
          user: { select: { firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!product) {
    return res.status(404).json({ message: "Маҳсулот ёфт нашуд" });
  }
  if (product.moderationStatus !== "APPROVED") {
    const seller = req.user
      ? await prisma.seller.findUnique({ where: { userId: req.user.id } })
      : null;
    const isOwner = seller?.id === product.sellerId;
    const isAdmin = req.user?.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return res.status(404).json({ message: "Маҳсулот ёфт нашуд" });
    }
  }
  return res.json(serializeProduct(product));
}

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  discount: z.number().min(0).max(90).optional(),
  categoryId: z.string(),
  brand: z.string().optional(),
  stock: z.number().int().min(0),
  images: z.array(z.string()).min(1),
  specs: z.record(z.string()).optional(),
});

export async function createProduct(req: AuthedRequest, res: Response) {
  const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
  if (!seller || seller.status !== "APPROVED") {
    return res.status(403).json({ message: "Seller ҳанӯз тасдиқ нашудааст" });
  }
  const data = req.body as z.infer<typeof productSchema>;
  const product = await prisma.product.create({
    data: {
      sellerId: seller.id,
      categoryId: data.categoryId,
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      price: data.price,
      discount: data.discount || 0,
      brand: data.brand,
      stock: data.stock,
      specs: data.specs,
      moderationStatus: "PENDING",
      images: {
        create: data.images.map((url, i) => ({ url, sortOrder: i })),
      },
    },
    include: { images: true, category: true },
  });

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type: "PRODUCT_PENDING",
      title: "Маҳсулоти нав барои moderation",
      body: `${seller.shopName}: ${product.name}`,
    })),
  });

  return res.status(201).json(serializeProduct(product));
}

export async function updateProduct(req: AuthedRequest, res: Response) {
  const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
  if (!seller) return res.status(403).json({ message: "Seller нест" });
  const existing = await prisma.product.findUnique({ where: { id: routeParam(req.params.id) } });
  if (!existing || existing.sellerId !== seller.id) {
    return res.status(404).json({ message: "Маҳсулот ёфт нашуд" });
  }
  const data = productSchema.partial().parse(req.body);
  const product = await prisma.product.update({
    where: { id: existing.id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      discount: data.discount,
      categoryId: data.categoryId,
      brand: data.brand,
      stock: data.stock,
      specs: data.specs,
      moderationStatus: "PENDING",
      images: data.images
        ? {
            deleteMany: {},
            create: data.images.map((url, i) => ({ url, sortOrder: i })),
          }
        : undefined,
    },
    include: { images: true, category: true },
  });
  return res.json(serializeProduct(product));
}

export async function deleteProduct(req: AuthedRequest, res: Response) {
  const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
  if (!seller) return res.status(403).json({ message: "Seller нест" });
  const existing = await prisma.product.findUnique({ where: { id: routeParam(req.params.id) } });
  if (!existing || existing.sellerId !== seller.id) {
    return res.status(404).json({ message: "Маҳсулот ёфт нашуд" });
  }
  await prisma.product.update({
    where: { id: existing.id },
    data: { moderationStatus: "HIDDEN" },
  });
  return res.json({ ok: true });
}

export async function sellerProducts(req: AuthedRequest, res: Response) {
  const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
  if (!seller) return res.status(403).json({ message: "Seller нест" });
  const items = await prisma.product.findMany({
    where: { sellerId: seller.id },
    include: { images: true, category: true, reviews: { select: { rating: true } } },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ items: items.map(serializeProduct) });
}

export async function homeSections(_req: AuthedRequest, res: Response) {
  const now = Date.now();
  if (homeCache && now - homeCache.at < 20_000) {
    return res.json(homeCache.data);
  }
  const include = {
    images: { take: 1, orderBy: { sortOrder: "asc" as const } },
    category: true,
    seller: { select: { id: true, shopName: true, logo: true, status: true } },
    reviews: { select: { rating: true } },
  };
  const where = { moderationStatus: "APPROVED" as const, stock: { gt: 0 } };
  const all = await prisma.product.findMany({
    where,
    include,
    orderBy: { createdAt: "desc" },
    take: 24,
  });
  const scored = all.map(serializeProduct);
  const newest = scored.slice(0, 8);
  const deals = scored.filter((p) => p.discount > 0).slice(0, 4);
  const dealIds = new Set(deals.map((p) => p.id));
  let popular = [...scored]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .filter((p) => !dealIds.has(p.id) && !newest.some((n) => n.id === p.id))
    .slice(0, 8);
  if (popular.length < 4) {
    popular = scored.filter((p) => !dealIds.has(p.id)).slice(0, 8);
  }
  const data = { new: newest, popular, deals };
  homeCache = { at: now, data };
  return res.json(data);
}

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  category: true,
  seller: { select: { id: true, shopName: true, logo: true, status: true } },
  reviews: { select: { rating: true } },
};

export async function suggestProducts(req: AuthedRequest, res: Response) {
  const q = String(req.query.q || "").trim();
  if (q.length < 2) return res.json({ items: [] });
  const items = await prisma.product.findMany({
    where: {
      moderationStatus: "APPROVED",
      stock: { gt: 0 },
      OR: [{ name: { contains: q } }, { brand: { contains: q } }, { category: { name: { contains: q } } }],
    },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, category: true },
    take: 8,
  });
  return res.json({
    items: items.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category?.name,
      image: p.images[0]?.url,
      price: toNum(p.price),
      discount: toNum(p.discount),
      finalPrice: finalPrice(toNum(p.price), toNum(p.discount)),
    })),
  });
}

export async function flashDeals(_req: AuthedRequest, res: Response) {
  const items = await prisma.product.findMany({
    where: { moderationStatus: "APPROVED", stock: { gt: 0 }, discount: { gt: 0 } },
    include: productInclude,
    orderBy: { discount: "desc" },
    take: 8,
  });
  const endsAt = new Date();
  endsAt.setHours(23, 59, 59, 0);
  return res.json({ endsAt: endsAt.toISOString(), items: items.map(serializeProduct) });
}

export async function relatedProducts(req: AuthedRequest, res: Response) {
  const id = routeParam(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.json({ items: [] });
  const items = await prisma.product.findMany({
    where: {
      moderationStatus: "APPROVED",
      stock: { gt: 0 },
      id: { not: id },
      OR: [
        { categoryId: product.categoryId },
        { sellerId: product.sellerId },
        ...(product.brand ? [{ brand: product.brand }] : []),
      ],
    },
    include: productInclude,
    take: 8,
  });
  return res.json({ items: items.map(serializeProduct) });
}

import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { routeParam, slugify } from "../utils/helpers";

let catCache: { at: number; data: unknown } | null = null;

export async function listCategories(_req: AuthedRequest, res: Response) {
  const now = Date.now();
  if (catCache && now - catCache.at < 30_000) return res.json(catCache.data);
  const items = await prisma.category.findMany({
    include: { children: true, _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  const data = { items: items.filter((c) => !c.parentId) };
  catCache = { at: now, data };
  return res.json(data);
}

export const categorySchema = z.object({
  name: z.string().min(2),
  image: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

export async function createCategory(req: AuthedRequest, res: Response) {
  const data = req.body as z.infer<typeof categorySchema>;
  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: slugify(data.name),
      image: data.image,
      description: data.description,
      parentId: data.parentId || null,
    },
  });
  return res.status(201).json(category);
}

export async function updateCategory(req: AuthedRequest, res: Response) {
  const data = categorySchema.partial().parse(req.body);
  const category = await prisma.category.update({
    where: { id: routeParam(req.params.id) },
    data: {
      name: data.name,
      image: data.image,
      description: data.description,
      parentId: data.parentId,
    },
  });
  return res.json(category);
}

export async function deleteCategory(req: AuthedRequest, res: Response) {
  await prisma.category.delete({ where: { id: routeParam(req.params.id) } });
  return res.json({ ok: true });
}

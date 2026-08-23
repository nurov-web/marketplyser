import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { routeParam, slugify } from "../utils/helpers";

let catCache: { at: number; data: unknown } | null = null;

function bustCatCache() {
  catCache = null;
}

export async function listCategories(_req: AuthedRequest, res: Response) {
  const now = Date.now();
  if (catCache && now - catCache.at < 90_000) {
    res.setHeader("Cache-Control", "public, max-age=45, s-maxage=90, stale-while-revalidate=180");
    return res.json(catCache.data);
  }
  const items = await prisma.category.findMany({
    where: { parentId: null },
    select: { id: true, name: true, slug: true, image: true, description: true, parentId: true },
    orderBy: { name: "asc" },
  });
  const data = { items };
  catCache = { at: now, data };
  res.setHeader("Cache-Control", "public, max-age=45, s-maxage=90, stale-while-revalidate=180");
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
  const root = slugify(data.name) || `cat-${Date.now()}`;
  let slug = root;
  let n = 0;
  while (await prisma.category.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  const category = await prisma.category.create({
    data: {
      name: data.name.trim(),
      slug,
      image: data.image,
      description: data.description,
      parentId: data.parentId || null,
    },
  });
  bustCatCache();
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
  bustCatCache();
  return res.json(category);
}

export async function deleteCategory(req: AuthedRequest, res: Response) {
  const id = routeParam(req.params.id);
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return res.status(409).json({
      message: `Аввал ${count} молро аз ин категория нест кунед ё ба категорияи дигар кӯчонед`,
    });
  }
  await prisma.category.delete({ where: { id } });
  bustCatCache();
  return res.json({ ok: true });
}

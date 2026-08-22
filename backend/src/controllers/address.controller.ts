import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { routeParam } from "../utils/helpers";

export const addressSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().min(7),
  city: z.string().min(2),
  address: z.string().min(5),
  isDefault: z.boolean().optional(),
});

export async function listAddresses(req: AuthedRequest, res: Response) {
  const items = await prisma.address.findMany({
    where: { userId: req.user!.id },
    orderBy: { isDefault: "desc" },
  });
  return res.json({ items });
}

export async function createAddress(req: AuthedRequest, res: Response) {
  const data = addressSchema.parse(req.body);
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
  }
  const item = await prisma.address.create({
    data: { ...data, isDefault: data.isDefault ?? false, userId: req.user!.id },
  });
  return res.status(201).json(item);
}

export async function updateAddress(req: AuthedRequest, res: Response) {
  const id = routeParam(req.params.id);
  const existing = await prisma.address.findFirst({ where: { id, userId: req.user!.id } });
  if (!existing) return res.status(404).json({ message: "Суроға ёфт нашуд" });
  const data = addressSchema.partial().parse(req.body);
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
  }
  const item = await prisma.address.update({ where: { id }, data });
  return res.json(item);
}

export async function deleteAddress(req: AuthedRequest, res: Response) {
  const id = routeParam(req.params.id);
  await prisma.address.deleteMany({ where: { id, userId: req.user!.id } });
  return res.json({ ok: true });
}

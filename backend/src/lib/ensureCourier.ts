import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { geocodeCity, jitter } from "./geo";

export async function ensureCourier() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COURIER'`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!/already exists|duplicate/i.test(message)) {
      console.warn("Role COURIER:", message);
    }
  }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "lat" DOUBLE PRECISION`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "lng" DOUBLE PRECISION`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "courierId" TEXT`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Order_courierId_idx" ON "Order"("courierId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status")`);
  } catch (err) {
    console.warn("Order courier columns:", err instanceof Error ? err.message : err);
  }

  const email = "courier@nurov.tj";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash("Courier123!", 12);
    await prisma.user.create({
      data: {
        firstName: "Расул",
        lastName: "Расулов",
        email,
        phone: "+992900000004",
        passwordHash,
        role: "COURIER",
      },
    });
    console.log("Courier user: courier@nurov.tj / Courier123!");
  } else if (existing.role !== "COURIER") {
    await prisma.user.update({ where: { id: existing.id }, data: { role: "COURIER" } });
  }

  const missing = await prisma.order.findMany({
    where: { OR: [{ lat: null }, { lng: null }] },
    select: { id: true, city: true },
    take: 400,
  });
  for (const row of missing) {
    const geo = geocodeCity(row.city);
    const point = jitter(row.id, geo.lat, geo.lng);
    await prisma.order.update({ where: { id: row.id }, data: point });
  }
}

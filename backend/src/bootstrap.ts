import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";

export async function ensureBootstrapUsers() {
  const count = await prisma.user.count();
  if (count > 0) return;

  const password = await bcrypt.hash("Admin123!", 12);
  const sellerPass = await bcrypt.hash("Seller123!", 12);
  const userPass = await bcrypt.hash("User123!", 12);

  await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "Nurov",
      email: "admin@nurov.tj",
      phone: "+992900000001",
      passwordHash: password,
      role: "ADMIN",
    },
  });

  const sellerUser = await prisma.user.create({
    data: {
      firstName: "Фарход",
      lastName: "Нуров",
      email: "seller@nurov.tj",
      phone: "+992900000002",
      passwordHash: sellerPass,
      role: "SELLER",
    },
  });

  await prisma.user.create({
    data: {
      firstName: "Дилшод",
      lastName: "Каримов",
      email: "user@nurov.tj",
      phone: "+992900000003",
      passwordHash: userPass,
      role: "USER",
    },
  });

  await prisma.seller.create({
    data: {
      userId: sellerUser.id,
      shopName: "Nurov Store",
      phone: "+992900000002",
      email: "seller@nurov.tj",
      address: "Душанбе",
      description: "Мағозаи расмӣ",
      documents: [],
      status: "APPROVED",
    },
  });

  console.log("Bootstrap users created: admin@nurov.tj / seller@nurov.tj / user@nurov.tj");
}

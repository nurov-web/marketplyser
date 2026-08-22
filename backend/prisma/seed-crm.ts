import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  if ((await prisma.crmLead.count()) > 0) {
    console.log("CRM already seeded");
    return;
  }
  await prisma.crmContact.create({
    data: { name: "Дилшод Каримов", phone: "+992900000003", email: "user@nurov.tj", company: "Nurov" },
  });
  await prisma.crmLead.create({
    data: { title: "Саволи MacBook", name: "Зарина", phone: "+992900000010", status: "NEW", source: "CHAT" },
  });
  await prisma.crmDeal.create({
    data: { title: "Order #10245", amount: 10000, stage: "WON" },
  });
  console.log("CRM seed OK");
}

main().finally(() => prisma.$disconnect());

import http from "http";
import { config } from "./config";
import { createApp } from "./app";
import { initSocket } from "./socket";
import { prisma } from "./lib/prisma";

import http from "http";
import { config } from "./config";
import { createApp } from "./app";
import { initSocket } from "./socket";
import { prisma } from "./lib/prisma";

async function ensureCoupons() {
  const count = await prisma.coupon.count();
  if (count > 0) return;
  const week = new Date();
  week.setDate(week.getDate() + 14);
  await prisma.coupon.createMany({
    data: [
      { code: "NUROV10", type: "PERCENT", value: 10, minSubtotal: 50, maxUses: 999, active: true, expiresAt: week },
      { code: "SALE20", type: "PERCENT", value: 20, minSubtotal: 200, maxUses: 200, active: true, expiresAt: week },
      { code: "WELCOME", type: "FIXED", value: 15, minSubtotal: 30, maxUses: 999, active: true, expiresAt: week },
    ],
  });
}

const app = createApp();
const server = http.createServer(app);
initSocket(server);

server.listen(config.port, async () => {
  await ensureCoupons().catch(() => {});
  console.log(`Nurov API → http://localhost:${config.port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});

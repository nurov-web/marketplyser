import http from "http";
import { assertProductionSecrets, config } from "./config";
import { createApp } from "./app";
import { initSocket } from "./socket";
import { prisma } from "./lib/prisma";
import { ensureBootstrapUsers } from "./bootstrap";

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

async function bootstrap() {
  await ensureBootstrapUsers().catch((e) => console.error("user bootstrap failed", e));
  await ensureCoupons().catch((e) => console.error("coupon bootstrap failed", e));
}

const app = createApp();
export default app;

try {
  assertProductionSecrets();
} catch (err) {
  console.error((err as Error).message);
  if (!process.env.VERCEL) process.exit(1);
}

if (!process.env.VERCEL) {
  const server = http.createServer(app);
  initSocket(server);
  server.listen(config.port, "0.0.0.0", () => {
    console.log(`Nurov API → http://0.0.0.0:${config.port}`);
    void bootstrap();
  });

  async function shutdown() {
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

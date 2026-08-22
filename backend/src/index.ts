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
const server = http.createServer(app);
initSocket(server);

export default app;

if (process.env.VERCEL) {
  void bootstrap();
} else {
  try {
    assertProductionSecrets();
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }

  server.listen(config.port, "0.0.0.0", async () => {
    await bootstrap();
    console.log(`Nurov API → http://0.0.0.0:${config.port}`);
  });

  async function shutdown() {
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import { config } from "./config";
import { prisma } from "./lib/prisma";
import { isAllowedOrigin } from "./lib/origins";
import { rateLimit } from "./middleware/rateLimit";
import { errorHandler, notFound } from "./middleware/error";
import { authRouter } from "./routes/auth.routes";
import { productRouter } from "./routes/product.routes";
import { categoryRouter } from "./routes/category.routes";
import { cartRouter } from "./routes/cart.routes";
import { orderRouter } from "./routes/order.routes";
import { sellerRouter } from "./routes/seller.routes";
import { reviewRouter } from "./routes/review.routes";
import { favoriteRouter } from "./routes/favorite.routes";
import { messageRouter } from "./routes/message.routes";
import { notificationRouter } from "./routes/notification.routes";
import { uploadRouter } from "./routes/upload.routes";
import { adminRouter } from "./routes/admin.routes";
import { miscRouter } from "./routes/misc.routes";
import { couponRouter } from "./routes/coupon.routes";
import { serviceRouter } from "./routes/service.routes";

function catchAsyncErrors() {
  try {
    // Express 4 does not forward rejected promises to errorHandler.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Layer = require("express/lib/router/layer");
    const orig = Layer.prototype.handle_request;
    Layer.prototype.handle_request = function handleRequest(req: unknown, res: unknown, next: (err?: unknown) => void) {
      if (this.handle.length > 3) return orig.apply(this, arguments);
      try {
        const result = this.handle(req, res, next);
        if (result && typeof result.catch === "function") result.catch(next);
      } catch (err) {
        next(err);
      }
    };
  } catch {
    /* older express layouts */
  }
}

export function createApp() {
  catchAsyncErrors();
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use("/uploads", express.static(path.resolve(config.uploadDir), { maxAge: "7d", etag: true }));
  const limiter = rateLimit({ windowSec: 60, max: 200, prefix: "global" });
  app.use((req, res, next) => {
    if (
      req.method === "GET" &&
      (req.path === "/api/health" ||
        req.path === "/api/categories" ||
        req.path === "/api/services/categories" ||
        req.path.startsWith("/api/services/providers") ||
        req.path === "/api/products/home/sections" ||
        req.path === "/api/products/deals")
    ) {
      return next();
    }
    return limiter(req, res, next);
  });

  app.get("/api/health", async (_req, res) => {
    let db = "skipped";
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = "ok";
    } catch (err) {
      db = err instanceof Error ? err.message : String(err);
    }
    res.json({
      ok: db === "ok",
      name: "Nurov Marketplace API",
      db,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasDirectUrl: Boolean(process.env.DIRECT_URL),
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/products", productRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/orders", orderRouter);
  app.use("/api/sellers", sellerRouter);
  app.use("/api/reviews", reviewRouter);
  app.use("/api/favorites", favoriteRouter);
  app.use("/api/messages", messageRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/upload", uploadRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/coupons", couponRouter);
  app.use("/api/services", serviceRouter);
  app.use("/api", miscRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

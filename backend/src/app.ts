import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import { config } from "./config";
import { isAllowedOrigin } from "./lib/origins";
import { rateLimit } from "./middleware/rateLimit";
import { errorHandler, notFound } from "./middleware/error";
import { ah } from "./utils/asyncHandler";
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

export function createApp() {
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
  app.use("/uploads", express.static(path.resolve(config.uploadDir)));
  app.use(ah(rateLimit({ windowSec: 60, max: 200, prefix: "global" })));

  app.get("/api/health", (_req, res) => res.json({ ok: true, name: "Nurov Marketplace API" }));

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
  app.use("/api", miscRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

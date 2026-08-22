import { Router } from "express";
import * as orders from "../controllers/order.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { ah } from "../utils/asyncHandler";

export const orderRouter = Router();

orderRouter.use(authenticate);
orderRouter.post("/", validate(orders.checkoutSchema), ah(orders.placeOrder));
orderRouter.get("/", ah(orders.listOrders));
orderRouter.get("/seller/mine", requireRole("SELLER", "ADMIN"), ah(orders.sellerOrders));
orderRouter.patch("/items/:id/status", requireRole("SELLER", "ADMIN"), ah(orders.updateSellerOrderStatus));
orderRouter.get("/:id", ah(orders.getOrder));
orderRouter.post("/:id/cancel", ah(orders.cancelOrder));

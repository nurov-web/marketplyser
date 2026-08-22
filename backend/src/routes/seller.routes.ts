import { Router } from "express";
import * as sellers from "../controllers/seller.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { ah } from "../utils/asyncHandler";

export const sellerRouter = Router();

sellerRouter.get("/", ah(sellers.publicSellers));
sellerRouter.get("/shop/:id", ah(sellers.publicShop));
sellerRouter.post("/", authenticate, validate(sellers.sellerApplySchema), ah(sellers.applySeller));
sellerRouter.get("/me", authenticate, requireRole("SELLER", "ADMIN"), ah(sellers.getSellerMe));
sellerRouter.put("/me", authenticate, requireRole("SELLER", "ADMIN"), ah(sellers.updateSellerProfile));
sellerRouter.get("/dashboard", authenticate, requireRole("SELLER", "ADMIN"), ah(sellers.sellerDashboard));

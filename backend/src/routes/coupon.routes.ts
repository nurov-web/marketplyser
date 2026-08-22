import { Router } from "express";
import { optionalAuth } from "../middleware/auth";
import { ah } from "../utils/asyncHandler";
import * as coupons from "../controllers/coupon.controller";

export const couponRouter = Router();
couponRouter.post("/validate", optionalAuth, ah(coupons.validateCoupon));
couponRouter.get("/validate", optionalAuth, ah(coupons.validateCoupon));

import { Router } from "express";
import * as products from "../controllers/product.controller";
import { authenticate, optionalAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { ah } from "../utils/asyncHandler";

export const productRouter = Router();

productRouter.get("/", optionalAuth, ah(products.listProducts));
productRouter.get("/home/sections", ah(products.homeSections));
productRouter.get("/suggest", ah(products.suggestProducts));
productRouter.get("/deals", ah(products.flashDeals));
productRouter.get("/seller/mine", authenticate, requireRole("ADMIN"), ah(products.sellerProducts));
productRouter.get("/:id/related", optionalAuth, ah(products.relatedProducts));
productRouter.get("/:id", optionalAuth, ah(products.getProduct));
productRouter.post("/", authenticate, requireRole("ADMIN"), validate(products.productSchema), ah(products.createProduct));
productRouter.put("/:id", authenticate, requireRole("ADMIN"), ah(products.updateProduct));
productRouter.delete("/:id", authenticate, requireRole("ADMIN"), ah(products.deleteProduct));

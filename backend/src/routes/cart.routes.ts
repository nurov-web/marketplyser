import { Router } from "express";
import * as cart from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { ah } from "../utils/asyncHandler";

export const cartRouter = Router();

cartRouter.use(authenticate);
cartRouter.get("/", ah(cart.getCart));
cartRouter.post("/", validate(cart.cartSchema), ah(cart.addToCart));
cartRouter.put("/:id", ah(cart.updateCartItem));
cartRouter.delete("/:id", ah(cart.removeCartItem));

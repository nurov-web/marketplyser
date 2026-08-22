import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as addr from "../controllers/address.controller";
import * as admin from "../controllers/admin.controller";
import { ah } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";

export const miscRouter = Router();

miscRouter.get("/addresses", authenticate, ah(addr.listAddresses));
miscRouter.post("/addresses", authenticate, validate(addr.addressSchema), ah(addr.createAddress));
miscRouter.put("/addresses/:id", authenticate, ah(addr.updateAddress));
miscRouter.delete("/addresses/:id", authenticate, ah(addr.deleteAddress));
miscRouter.post("/reports", authenticate, ah(admin.createReport));

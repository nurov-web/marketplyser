import { Router } from "express";
import * as courier from "../controllers/courier.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { ah } from "../utils/asyncHandler";

export const courierRouter = Router();

courierRouter.use(authenticate);
courierRouter.get("/apply", ah(courier.myApplication));
courierRouter.post("/apply", validate(courier.courierApplySchema), ah(courier.applyCourier));

courierRouter.get("/loads", requireRole("COURIER", "ADMIN"), ah(courier.listLoads));
courierRouter.get("/loads/:id", requireRole("COURIER", "ADMIN"), ah(courier.getLoad));
courierRouter.patch("/loads/:id", requireRole("COURIER", "ADMIN"), ah(courier.updateLoad));

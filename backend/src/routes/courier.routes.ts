import { Router } from "express";
import * as courier from "../controllers/courier.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { ah } from "../utils/asyncHandler";

export const courierRouter = Router();

courierRouter.use(authenticate, requireRole("COURIER", "ADMIN"));
courierRouter.get("/loads", ah(courier.listLoads));
courierRouter.get("/loads/:id", ah(courier.getLoad));
courierRouter.patch("/loads/:id", ah(courier.updateLoad));

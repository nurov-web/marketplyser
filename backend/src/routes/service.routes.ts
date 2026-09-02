import { Router } from "express";
import * as svc from "../controllers/service.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { ah } from "../utils/asyncHandler";

export const serviceRouter = Router();

serviceRouter.get("/categories", ah(svc.listServiceCategories));
serviceRouter.get("/providers", ah(svc.listServiceProviders));
serviceRouter.get("/providers/:id", ah(svc.getServiceProvider));
serviceRouter.post("/requests", validate(svc.serviceRequestSchema), ah(svc.createServiceRequest));

serviceRouter.get(
  "/seller/requests",
  authenticate,
  requireRole("SELLER", "ADMIN"),
  ah(svc.sellerServiceRequests),
);

serviceRouter.get(
  "/admin/providers",
  authenticate,
  requireRole("ADMIN"),
  ah(svc.adminListServiceProviders),
);
serviceRouter.patch(
  "/admin/providers/:id",
  authenticate,
  requireRole("ADMIN"),
  ah(svc.adminUpdateServiceProvider),
);
serviceRouter.get(
  "/admin/requests",
  authenticate,
  requireRole("ADMIN"),
  ah(svc.adminListServiceRequests),
);
serviceRouter.patch(
  "/admin/requests/:id",
  authenticate,
  requireRole("ADMIN"),
  ah(svc.adminUpdateServiceRequest),
);

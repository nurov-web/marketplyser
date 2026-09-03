import { Router } from "express";
import * as admin from "../controllers/admin.controller";
import * as cats from "../controllers/category.controller";
import * as crm from "../controllers/crm.controller";
import * as courier from "../controllers/courier.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { ah } from "../utils/asyncHandler";

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole("ADMIN"));

adminRouter.get("/dashboard", ah(admin.adminDashboard));
adminRouter.get("/users", ah(admin.adminUsers));
adminRouter.post("/users/:id", ah(admin.adminUserAction));

adminRouter.get("/sellers", ah(admin.adminSellers));
adminRouter.get("/sellers/:id", ah(admin.adminSellerDetail));
adminRouter.post("/sellers/:id", ah(admin.adminSellerAction));

adminRouter.get("/couriers", ah(courier.adminCourierApps));
adminRouter.post("/couriers/:id", ah(courier.adminCourierAct));

adminRouter.get("/products", ah(admin.adminProducts));
adminRouter.post("/products/:id", ah(admin.adminProductAction));
adminRouter.put("/products/:id", ah(admin.adminUpdateProduct));

adminRouter.get("/orders", ah(admin.adminOrders));

adminRouter.get("/categories", ah(cats.listCategories));
adminRouter.post("/categories", validate(cats.categorySchema), ah(cats.createCategory));
adminRouter.put("/categories/:id", ah(cats.updateCategory));
adminRouter.delete("/categories/:id", ah(cats.deleteCategory));

adminRouter.get("/reviews", ah(admin.adminReviews));
adminRouter.delete("/reviews/:id", ah(admin.adminDeleteReview));

adminRouter.get("/reports", ah(admin.adminReports));
adminRouter.post("/reports/:id", ah(admin.adminReportAction));

adminRouter.get("/penalties", ah(admin.adminPenalties));
adminRouter.get("/settings", ah(admin.adminSettings));
adminRouter.put("/settings", ah(admin.adminSettings));

adminRouter.get("/crm", ah(crm.listCrm));
adminRouter.post("/crm", ah(crm.createCrmRow));
adminRouter.patch("/crm/:entity/:id", ah(crm.updateCrmStatus));
adminRouter.post("/crm/sync-bitrix", ah(crm.syncBitrix));

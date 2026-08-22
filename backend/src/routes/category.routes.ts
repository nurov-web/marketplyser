import { Router } from "express";
import * as cats from "../controllers/category.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { ah } from "../utils/asyncHandler";

export const categoryRouter = Router();

categoryRouter.get("/", ah(cats.listCategories));
categoryRouter.post("/", authenticate, requireRole("ADMIN"), validate(cats.categorySchema), ah(cats.createCategory));
categoryRouter.put("/:id", authenticate, requireRole("ADMIN"), ah(cats.updateCategory));
categoryRouter.delete("/:id", authenticate, requireRole("ADMIN"), ah(cats.deleteCategory));

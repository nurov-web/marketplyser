import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { upload } from "../lib/upload";
import * as up from "../controllers/upload.controller";
import { ah } from "../utils/asyncHandler";

export const uploadRouter = Router();

uploadRouter.use(authenticate, requireRole("ADMIN"));
uploadRouter.post("/", upload.single("file"), ah(up.uploadImage));
uploadRouter.post("/many", upload.array("files", 8), ah(up.uploadImages));
uploadRouter.post("/", upload.single("file"), ah(up.uploadImage));
uploadRouter.post("/many", upload.array("files", 8), ah(up.uploadImages));

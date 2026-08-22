import { Router } from "express";
import * as n from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth";
import { ah } from "../utils/asyncHandler";

export const notificationRouter = Router();

notificationRouter.use(authenticate);
notificationRouter.get("/", ah(n.listNotifications));
notificationRouter.post("/read-all", ah(n.markAllRead));
notificationRouter.post("/:id/read", ah(n.markRead));

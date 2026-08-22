import { Router } from "express";
import * as msg from "../controllers/message.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { ah } from "../utils/asyncHandler";

export const messageRouter = Router();

messageRouter.use(authenticate);
messageRouter.get("/", ah(msg.listConversations));
messageRouter.get("/admin/all", requireRole("ADMIN"), ah(msg.adminConversations));
messageRouter.get("/:id", ah(msg.getMessages));
messageRouter.post("/", validate(msg.messageSchema), ah(msg.sendMessage));

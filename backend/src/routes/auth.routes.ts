import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import { authenticate, softAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { rateLimit } from "../middleware/rateLimit";
import { ah } from "../utils/asyncHandler";

export const authRouter = Router();

authRouter.post("/register", rateLimit({ windowSec: 60, max: 10, prefix: "reg" }), validate(auth.registerSchema), ah(auth.register));
authRouter.post("/oauth", rateLimit({ windowSec: 60, max: 20, prefix: "oauth" }), validate(auth.oauthSchema), ah(auth.oauth));
authRouter.post("/login", rateLimit({ windowSec: 60, max: 20, prefix: "login" }), validate(auth.loginSchema), ah(auth.login));
authRouter.post("/logout", ah(auth.logout));
authRouter.post("/refresh", ah(auth.refresh));
authRouter.get("/me", softAuth, ah(auth.me));
authRouter.put("/me", authenticate, ah(auth.updateProfile));

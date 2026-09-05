import { Router } from "express";
import { handleAIChatMessage } from "./ai.controller.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";
import aiChatLimiter from "../../shared/middlewares/aiRateLimit.middleware.js";

const router = Router();

router.route("/chat").post(authenticateUser, aiChatLimiter, handleAIChatMessage);

export default router;
import { Router } from "express";
import { handleAIChatMessage, handleExportAISummaryPDF, handleGenerateAlias, handleGenerateTitle } from "./ai.controller.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";
import aiChatLimiter from "../../shared/middlewares/aiRateLimit.middleware.js";

const router = Router();

router.route("/chat").post(authenticateUser, aiChatLimiter, handleAIChatMessage);

router.route("/export/pdf").post(authenticateUser, handleExportAISummaryPDF);

router.route("/generate/alias").post(authenticateUser, aiChatLimiter, handleGenerateAlias);

router.route("/generate/title").post(authenticateUser, aiChatLimiter, handleGenerateTitle);

export default router;
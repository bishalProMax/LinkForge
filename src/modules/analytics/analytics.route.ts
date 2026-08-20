import { Router } from "express";
import { handleGetAnalyticsOverview, handleExportAnalyticsCSV, handleExportAnalyticsPDF } from "./analytics.controller.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";

const router = Router();

router.route("/overview").get(authenticateUser, handleGetAnalyticsOverview);
router.route("/export/csv/:metric").get(authenticateUser, handleExportAnalyticsCSV);
router.route("/export/pdf").post(authenticateUser, handleExportAnalyticsPDF);

export default router;
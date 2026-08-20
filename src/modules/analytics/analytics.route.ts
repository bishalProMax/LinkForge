import { Router } from "express";
import { handleGetAnalyticsOverview, handleExportAnalyticsCSV, handleExportAnalyticsPDF, handleExportRawEventsCSV } from "./analytics.controller.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";

const router = Router();

router.route("/overview").get(authenticateUser, handleGetAnalyticsOverview);
router.route("/export/csv/:metric").get(authenticateUser, handleExportAnalyticsCSV);
router.route("/export/pdf").post(authenticateUser, handleExportAnalyticsPDF);
router.route("/export/raw").get(authenticateUser, handleExportRawEventsCSV);

export default router;
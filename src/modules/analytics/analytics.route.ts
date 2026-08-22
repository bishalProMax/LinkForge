import { Router } from "express";
import { handleGetAnalyticsOverview, handleExportAnalyticsCSV, handleExportAnalyticsPDF, handleExportRawEventsCSV, handleAnalyticsStream } from "./analytics.controller.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";

const router = Router();

router.route("/overview").get(authenticateUser, handleGetAnalyticsOverview);

router.route("/export/csv/:metric").get(authenticateUser, handleExportAnalyticsCSV);

router.route("/export/pdf").post(authenticateUser, handleExportAnalyticsPDF);

router.route("/export/raw").get(authenticateUser, handleExportRawEventsCSV);

router.route("/stream").get(authenticateUser, handleAnalyticsStream);

export default router;
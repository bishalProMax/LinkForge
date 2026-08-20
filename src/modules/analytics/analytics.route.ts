import { Router } from "express";
import { handleGetAnalyticsOverview } from "./analytics.controller.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";

const router = Router();

router.route("/overview").get(authenticateUser, handleGetAnalyticsOverview);

export default router;
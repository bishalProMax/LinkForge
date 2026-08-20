import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { getAnalyticsOverview } from "./analytics.service.js";
import type { AnalyticsQueryParams } from "./analytics.types.js";

const parseParams = (req: Request): AnalyticsQueryParams => ({
  type: req.query.type === "qr" ? "qr" : "url",
  id: typeof req.query.id === "string" ? req.query.id : undefined,
  userId: typeof req.query.userId === "string" ? req.query.userId : undefined,
  from: typeof req.query.from === "string" ? req.query.from : undefined,
  to: typeof req.query.to === "string" ? req.query.to : undefined,
  granularity: req.query.granularity === "hour" ? "hour" : "day",
});

// It powers the analytics page's stat cards + charts.
const handleGetAnalyticsOverview = asyncHandler(async (req: Request, res: Response) => {
  const params = parseParams(req);
  const requester = { id: req.user!.id, role: req.user!.role };

  const result = await getAnalyticsOverview(params, requester);

  if (!result) {
    return res.status(404).json({ success: false, message: "Not found, or you don't have access to this item." });
  }

  return res.status(200).json({ success: true, ...result });
});

export { handleGetAnalyticsOverview };
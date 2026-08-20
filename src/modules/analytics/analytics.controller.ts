import type { Request, Response } from "express";
import { format } from "fast-csv";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { getAnalyticsOverview, getExportData, getRawEventsExport } from "./analytics.service.js";
import { buildPdfFromPng } from "../../shared/utils/qrPdf.js";
import type { AnalyticsQueryParams, ExportMetric } from "./analytics.types.js";

const VALID_EXPORT_METRICS: ExportMetric[] = ["timeseries", "topItems", "country", "region", "city", "browser", "os", "device", "referrer"];

const parseParams = (req: Request): AnalyticsQueryParams => ({
  type: req.query.type === "qr" ? "qr" : "url",
  id: typeof req.query.id === "string" ? req.query.id : undefined,
  userId: typeof req.query.userId === "string" ? req.query.userId : undefined,
  from: typeof req.query.from === "string" ? req.query.from : undefined,
  to: typeof req.query.to === "string" ? req.query.to : undefined,
  granularity: req.query.granularity === "hour" ? "hour" : "day",
});

const handleGetAnalyticsOverview = asyncHandler(async (req: Request, res: Response) => {
  const params = parseParams(req);
  const requester = { id: req.user!.id, role: req.user!.role };

  const result = await getAnalyticsOverview(params, requester);

  if (!result) {
    return res.status(404).json({ success: false, message: "Not found, or you don't have access to this item." });
  }

  return res.status(200).json({ success: true, ...result });
});

const handleExportAnalyticsCSV = asyncHandler(async (req: Request, res: Response) => {
  const metric = req.params.metric as ExportMetric;

  if (!VALID_EXPORT_METRICS.includes(metric)) {
    return res.status(400).json({ success: false, message: "Unsupported export metric." });
  }

  const params = parseParams(req);
  const requester = { id: req.user!.id, role: req.user!.role };

  const data = await getExportData(metric, params, requester);

  if (!data) {
    return res.status(404).json({ success: false, message: "Not found, or you don't have access to this item." });
  }

  const filename = `analytics-${params.type}-${metric}-${new Date().toISOString().slice(0, 10)}.csv`;
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const csvStream = format({ headers: true });
  csvStream.pipe(res);
  data.forEach((row) => csvStream.write(row));
  csvStream.end();
});

const handleExportAnalyticsPDF = asyncHandler(async (req: Request, res: Response) => {
  const { imageBase64, filename } = req.body;

  if (typeof imageBase64 !== "string" || !imageBase64.startsWith("data:image/png;base64,")) {
    return res.status(400).json({ success: false, message: "A PNG image is required for PDF export." });
  }

  const pngBuffer = Buffer.from(imageBase64.split(",")[1], "base64");
  const pdfBuffer = await buildPdfFromPng(pngBuffer);
  const safeName = typeof filename === "string" && filename ? filename : "chart";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}.pdf"`);
  return res.status(200).send(pdfBuffer);
});

// Raw event log export. Available to any authenticated user, scoped normally — but the IP column
// only appears in the file when the requester is Admin/Super Admin (handled inside the service layer).
const handleExportRawEventsCSV = asyncHandler(async (req: Request, res: Response) => {
  const params = parseParams(req);
  const requester = { id: req.user!.id, role: req.user!.role };

  const data = await getRawEventsExport(params, requester);

  if (!data) {
    return res.status(404).json({ success: false, message: "Not found, or you don't have access to this item." });
  }

  const filename = `analytics-${params.type}-raw-${new Date().toISOString().slice(0, 10)}.csv`;
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const csvStream = format({ headers: true });
  csvStream.pipe(res);
  data.forEach((row) => csvStream.write(row));
  csvStream.end();
});

export { 
  handleGetAnalyticsOverview,
  handleExportAnalyticsCSV,
  handleExportAnalyticsPDF,
  handleExportRawEventsCSV
  };
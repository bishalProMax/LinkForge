import asyncHandler from "../../shared/utils/asyncHandler.js";
import type { Request, Response } from "express";
import { format } from "fast-csv";
import { parseCsvBuffer, parsePastedLines, startBulkLinkCreation, getBulkOperationStatus, startBulkQRCreation, getBulkResultsForExport, checkQrGenerationReadiness } from "./bulk.service.js";

//bulk link upload handler
const handleBulkLinkUpload = asyncHandler(async (req: Request, res: Response) => {
  const rows = req.file ? await parseCsvBuffer(req.file.buffer) : parsePastedLines(req.body.text ?? "");

  try {
    const operationId = await startBulkLinkCreation(req.user!.id, rows);
    return res.status(202).json({ success: true, operationId });
  } catch (error) {
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Unable to start bulk upload." });
  }
});

//bulk QR upload handler
const handleBulkQRUpload = asyncHandler(async (req: Request, res: Response) => {
  const rows = req.file ? await parseCsvBuffer(req.file.buffer) : parsePastedLines(req.body.text ?? "");

  try {
    const operationId = await startBulkQRCreation(req.user!.id, rows);
    return res.status(202).json({ success: true, operationId });
  } catch (error) {
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Unable to start bulk upload." });
  }
});

//bulk status handler
const handleGetBulkStatus = asyncHandler(async (req: Request, res: Response) => {
  const operation = await getBulkOperationStatus(req.params.operationId as string, req.user!.id);
  if (!operation) return res.status(404).json({ success: false, message: "Bulk operation not found." });

  return res.status(200).json({ success: true, status: operation.status, totalRows: operation.totalRows, processedRows: operation.processedRows });
});

//bulk export handler
const handleExportBulkResults = asyncHandler(async (req: Request, res: Response) => {
  const exportData = await getBulkResultsForExport(req.params.operationId as string, req.user!.id);
  if (!exportData) return res.status(404).json({ success: false, message: "Bulk operation not found." });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="bulk-results-${new Date().toISOString().slice(0, 10)}.csv"`);

  const csvStream = format({ headers: exportData.headers });
  csvStream.pipe(res);
  exportData.rows.forEach((row) => csvStream.write(row));
  csvStream.end();
});

//bulk sample CSV download handler
const handleDownloadSampleCsv = (req: Request, res: Response): void => {
  const type = req.params.type;
  const isQr = type === "qr";

    const content = isQr
    ? "destinationurl,title,expiration,customexpiry\nhttps://example.com,My Example Page,7d,\nhttps://example.org,,custom,2026-12-31\n"
    : "destinationurl,customalias,title,expiration,customexpiry\nhttps://example.com,my-link,My Example Page,7d,\nhttps://example.org,,,custom,2026-12-31\n";

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="sample-${type}.csv"`);
  res.send(content);
};

//bulk QR readiness check handler
const handleCheckQRReadiness = asyncHandler(async (req: Request, res: Response) => {
  const result = await checkQrGenerationReadiness(req.params.operationId as string, req.user!.id);
  if (!result) return res.status(404).json({ success: false, message: "Bulk operation not found." });
  return res.status(200).json({ success: true, ...result });
});

export { 
  handleBulkLinkUpload, 
  handleGetBulkStatus, 
  handleExportBulkResults,
  handleBulkQRUpload,
  handleDownloadSampleCsv,
  handleCheckQRReadiness
  };
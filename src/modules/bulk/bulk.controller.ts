import asyncHandler from "../../shared/utils/asyncHandler.js";
import type { Request, Response } from "express";
import { format } from "fast-csv";
import { parseCsvBuffer, parsePastedLines, startBulkLinkCreation, getBulkOperationStatus, startBulkQRCreation } from "./bulk.service.js";

const handleBulkLinkUpload = asyncHandler(async (req: Request, res: Response) => {
  const rows = req.file ? await parseCsvBuffer(req.file.buffer) : parsePastedLines(req.body.text ?? "");

  try {
    const operationId = await startBulkLinkCreation(req.user!.id, rows);
    return res.status(202).json({ success: true, operationId });
  } catch (error) {
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Unable to start bulk upload." });
  }
});

const handleBulkQRUpload = asyncHandler(async (req: Request, res: Response) => {
  const rows = req.file ? await parseCsvBuffer(req.file.buffer) : parsePastedLines(req.body.text ?? "");

  try {
    const operationId = await startBulkQRCreation(req.user!.id, rows);
    return res.status(202).json({ success: true, operationId });
  } catch (error) {
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Unable to start bulk upload." });
  }
});

const handleGetBulkStatus = asyncHandler(async (req: Request, res: Response) => {
  const operation = await getBulkOperationStatus(req.params.operationId as string, req.user!.id);
  if (!operation) return res.status(404).json({ success: false, message: "Bulk operation not found." });

  return res.status(200).json({ success: true, status: operation.status, totalRows: operation.totalRows, processedRows: operation.processedRows });
});

const handleExportBulkResults = asyncHandler(async (req: Request, res: Response) => {
  const operation = await getBulkOperationStatus(req.params.operationId as string, req.user!.id);
  if (!operation) return res.status(404).json({ success: false, message: "Bulk operation not found." });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="bulk-results-${operation._id}.csv"`);

  const csvStream = format({ headers: true });
  csvStream.pipe(res);
  operation.results
    .sort((a, b) => a.row - b.row)
    .forEach((r) => csvStream.write({ Row: r.row, Status: r.status, Input: JSON.stringify(r.input), ShortId: r.shortId ?? "", QrId: r.qrId ?? "", Error: r.error ?? "" }));
  csvStream.end();
});

export { 
  handleBulkLinkUpload, 
  handleGetBulkStatus, 
  handleExportBulkResults,
  handleBulkQRUpload 
  };
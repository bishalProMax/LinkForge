import { parse } from "fast-csv";
import { Readable } from "stream";
import { getStatusesByQrIds } from "../qr/qr.service.js";
import { createBulkOperation, findBulkOperationById } from "./bulk.repository.js";
import bulkLinkCreationQueue from "../../infrastructure/queues/bulkLinkCreation.queue.js";
import bulkQrCreationQueue from "../../infrastructure/queues/bulkQrCreation.queue.js";
import type { BulkLinkRowInput, BulkQRRowInput, BulkExportData } from "./bulk.types.js";

const MAX_BULK_ROWS = 500;

// Parses an uploaded CSV buffer
const parseCsvBuffer = (buffer: Buffer): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    const rows: Record<string, string>[] = [];
    Readable.from(buffer)
      .pipe(parse({ headers: (headers) => headers.map((h) => (h ? h.trim().toLowerCase().replace(/\s+/g, "") : "")), trim: true }))
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
};

const parsePastedLines = (text: string): Record<string, string>[] => {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url) => ({ url }));
};

const startBulkLinkCreation = async (userId: string, rows: Record<string, string>[]): Promise<string> => {
  if (rows.length === 0) throw new Error("No rows found to process.");
  if (rows.length > MAX_BULK_ROWS) throw new Error(`You can process up to ${MAX_BULK_ROWS} rows at once.`);

  const operation = await createBulkOperation(userId, "linkCreate", rows.length);

  await Promise.all(
    rows.map((row, index) =>
      bulkLinkCreationQueue.add("process-bulk-link-row", {
        bulkOperationId: operation._id.toString(),
        userId,
        row: index + 1,
        input: { destinationURL: row.destinationurl || row.url, customAlias: row.customalias, title: row.title, expiration: (row.expiration as BulkLinkRowInput["expiration"]) || "never", customExpiry: row.customexpiry },
      })
    )
  );

  return operation._id.toString();
};

const startBulkQRCreation = async (userId: string, rows: Record<string, string>[]): Promise<string> => {
  if (rows.length === 0) throw new Error("No rows found to process.");
  if (rows.length > MAX_BULK_ROWS) throw new Error(`You can process up to ${MAX_BULK_ROWS} rows at once.`);

  const operation = await createBulkOperation(userId, "qrCreate", rows.length);

  await Promise.all(
    rows.map((row, index) =>
      bulkQrCreationQueue.add("process-bulk-qr-row", {
        bulkOperationId: operation._id.toString(),
        userId,
        row: index + 1,
        input: { destinationURL: row.destinationurl || row.url, title: row.title, expiration: (row.expiration as BulkQRRowInput["expiration"]) || "never", customExpiry: row.customexpiry },
      })
    )
  );

  return operation._id.toString();
};

const getBulkOperationStatus = (id: string, userId: string) => {
  return findBulkOperationById(id, userId);
};

// generates the bulk export csv 
const getBulkResultsForExport = async (operationId: string, userId: string): Promise<BulkExportData | null> => {
  const operation = await getBulkOperationStatus(operationId, userId);
  if (!operation) return null;

  const isQr = operation.type === "qrCreate";
  const baseUrl = process.env.BASE_URL;

  let statusMap = new Map<string, string>();
  if (isQr) {
    const qrIds = operation.results.filter((r) => r.qrId).map((r) => r.qrId as string);
    if (qrIds.length > 0) statusMap = await getStatusesByQrIds(qrIds);
  }

  const headers = isQr ? ["Row", "Status", "DestinationURL", "QRImageURL", "Error"] : ["Row", "Status", "DestinationURL", "ShortLink", "Error"];

  const rows = operation.results
    .sort((a, b) => a.row - b.row)
    .map((r) => {
      const input = r.input as { url?: string; destinationURL?: string };
      const destinationURL = input.destinationURL ?? input.url ?? "";

      return isQr
        ? { Row: r.row, Status: r.status, DestinationURL: destinationURL, QRImageURL: r.qrId && statusMap.get(r.qrId) === "READY" ? `${baseUrl}/qr/${r.qrId}/image` : "Still generating or failed", Error: r.error ?? "" }
        : { Row: r.row, Status: r.status, DestinationURL: destinationURL, ShortLink: r.shortId ? `${baseUrl}/url/${r.shortId}` : "", Error: r.error ?? "" };
    });

  return { headers, rows };
};

const checkQrGenerationReadiness = async (operationId: string, userId: string): Promise<{ ready: boolean; pending: number } | null> => {
  const operation = await getBulkOperationStatus(operationId, userId);
  if (!operation) return null;
  if (operation.type !== "qrCreate") return { ready: true, pending: 0 };

  const qrIds = operation.results.filter((r) => r.qrId).map((r) => r.qrId as string);
  if (qrIds.length === 0) return { ready: true, pending: 0 };

  const statusMap = await getStatusesByQrIds(qrIds);
  const pending = [...statusMap.values()].filter((s) => s === "PENDING").length;
  return { ready: pending === 0, pending };
};

export { 
  parseCsvBuffer, 
  parsePastedLines, 
  startBulkLinkCreation, 
  startBulkQRCreation,
  getBulkOperationStatus,
  getBulkResultsForExport,
  checkQrGenerationReadiness
  };
import { parse } from "fast-csv";
import { Readable } from "stream";
import { createBulkOperation, findBulkOperationById } from "./bulk.repository.js";
import bulkLinkCreationQueue from "../../infrastructure/queues/bulkLinkCreation.queue.js";
import bulkQrCreationQueue from "../../infrastructure/queues/bulkQrCreation.queue.js";
import type { BulkLinkRowInput } from "./bulk.types.js";
import type { BulkQRRowInput } from "./bulk.types.js";

const MAX_BULK_ROWS = 500;

// Parses an uploaded CSV buffer
const parseCsvBuffer = (buffer: Buffer): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    const rows: Record<string, string>[] = [];
    Readable.from(buffer)
      .pipe(parse({ headers: true, trim: true }))
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
        input: { url: row.url, customAlias: row.customAlias, title: row.title, expiration: (row.expiration as BulkLinkRowInput["expiration"]) || "never" },
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
        input: { destinationURL: row.url || row.destinationURL, title: row.title, expiration: (row.expiration as BulkQRRowInput["expiration"]) || "never" },
      })
    )
  );

  return operation._id.toString();
};

const getBulkOperationStatus = (id: string, userId: string) => {
  return findBulkOperationById(id, userId);
};

export { 
  parseCsvBuffer, 
  parsePastedLines, 
  startBulkLinkCreation, 
  startBulkQRCreation,
  getBulkOperationStatus 
  };
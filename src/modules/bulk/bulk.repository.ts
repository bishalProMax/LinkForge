import BulkOperation from "../../models/bulkOperation.model.js";
import type { IBulkOperationResultRow } from "../../models/bulkOperation.model.js";

const createBulkOperation = (userId: string, type: "linkCreate" | "qrCreate", totalRows: number) => {
  return BulkOperation.create({ userId, type, totalRows, status: "PROCESSING", processedRows: 0, results: [] });
};

const findBulkOperationById = (id: string, userId: string) => {
  return BulkOperation.findOne({ _id: id, userId });
};

// $push + $inc atomically — many worker jobs from the same batch write concurrently.
const appendBulkResult = async (id: string, result: IBulkOperationResultRow): Promise<void> => {
  const updated = await BulkOperation.findByIdAndUpdate(
    id,
    { $push: { results: result }, $inc: { processedRows: 1 } },
    { returnDocument: "after" }
  );

  if (updated && updated.processedRows >= updated.totalRows) {
    await BulkOperation.findByIdAndUpdate(id, { status: "COMPLETED" });
  }
};

export { 
  createBulkOperation, 
  findBulkOperationById, 
  appendBulkResult 
  };
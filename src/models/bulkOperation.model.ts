import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";

export interface IBulkOperationResultRow {
  row: number;
  status: "SUCCESS" | "FAILED";
  input: Record<string, unknown>;
  shortId?: string;
  qrId?: string;
  error?: string;
}

export interface IBulkOperation {
  userId: mongoose.Types.ObjectId;
  type: "linkCreate" | "qrCreate";
  status: "PROCESSING" | "COMPLETED";
  totalRows: number;
  processedRows: number;
  results: IBulkOperationResultRow[];
  createdAt: Date;
  updatedAt: Date;
}

export type BulkOperationDocument = HydratedDocument<IBulkOperation>;

type BulkOperationModel = mongoose.Model<IBulkOperation>;

const resultRowSchema = new mongoose.Schema<IBulkOperationResultRow>(
  {
    row: { 
        type: Number, 
        required: true 
    },

    status: { 
        type: String, 
        enum: ["SUCCESS", "FAILED"], 
        required: true 
    },

    input: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true 
    },

    shortId: { 
        type: String 
    },

    qrId: { 
        type: String 
    },

    error: { 
        type: String 
    },
  },
  { 
    _id: false 
  }
);

const bulkOperationSchema = new mongoose.Schema<IBulkOperation, BulkOperationModel>(
  {
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true, 
        index: true 
    },

    type: { 
        type: String, 
        enum: ["linkCreate", "qrCreate"], 
        required: true 
    },

    status: { 
        type: String, 
        enum: ["PROCESSING", "COMPLETED"], 
        default: "PROCESSING" 
    },

    totalRows: { 
        type: Number, 
        required: true 
    },

    processedRows: { 
        type: Number, 
        default: 0 
    },

    results: { 
        type: [resultRowSchema], 
        default: [] 
    },
  },
  { 
    timestamps: true 
}
);

const BulkOperation = mongoose.model<IBulkOperation, BulkOperationModel>("BulkOperation", bulkOperationSchema);

export default BulkOperation;
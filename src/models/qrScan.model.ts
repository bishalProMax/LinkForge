import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";

// -----------------------------QRSCAN INTERFACE-----------------------------
export interface IQRScan {
  qrId: mongoose.Types.ObjectId;
  timestamp: Date;
}

// -----------------------------QRSCAN DOCUMENT-----------------------------
export type QRScanDocument = HydratedDocument<IQRScan>;

// -----------------------------QRSCAN MODEL-----------------------------
type QRScanModel = mongoose.Model<IQRScan>;

// -----------------------------SCHEMA-----------------------------
const qrScanSchema = new mongoose.Schema<IQRScan, QRScanModel>(
  {
    qrId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QRCode",
      required: true,
      index: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

qrScanSchema.index({
  qrId: 1,
  timestamp: -1,
});

const QRScan = mongoose.model<IQRScan, QRScanModel>("QRScan", qrScanSchema);

export default QRScan;
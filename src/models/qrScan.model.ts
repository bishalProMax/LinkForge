import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";

// -----------------------------QRSCAN INTERFACE-----------------------------
export interface IQRScan {
  qrId: mongoose.Types.ObjectId;
  ip?: string;
  country?: string;
  region?: string;
  city?: string;
  browser?: string;
  os?: string;
  device?: string;
  referrer?: string;
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

    ip: {
      type: String,
      select: false,
    },

    country: {
      type: String,
    },

    region: {
      type: String,
    },

    city: {
      type: String,
    },

    browser: {
      type: String,
    },

    os: {
      type: String,
    },

    device: {
      type: String,
    },

    referrer: {
      type: String,
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
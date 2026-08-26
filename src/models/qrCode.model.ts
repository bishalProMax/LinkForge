import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";

// -----------------------------QR DESIGN SUBDOCUMENT-----------------------------
export interface IQRDesign {
  fgColor: string;
  bgColor: string;
  dotStyle: "square" | "rounded" | "dots";
  frameShape: "sharp" | "round";
}

const qrDesignSchema = new mongoose.Schema<IQRDesign>(
  {
    fgColor: { 
      type: String, 
      default: "#000000" 
    },

    bgColor: { 
      type: String, 
      default: "#ffffff" 
    },

    dotStyle: { 
      type: String, 
      enum: ["square", "rounded", "dots"], 
      default: "square" 
    },

    frameShape: { 
      type: String, 
      enum: ["sharp", "round"], 
      default: "sharp" 
    },
  },
  { 
    _id: false 
  }
);

// -----------------------------QRCODE INTERFACE-----------------------------
export interface IQRCode {
  qrId: string;
  createdBy: mongoose.Types.ObjectId;
  linkedUrlId: mongoose.Types.ObjectId | null; 
  title?: string;
  destinationURL?: string;
  expiresAt: Date | null;
  isDisabled: boolean;
  design: IQRDesign;
  status: "PENDING" | "READY" | "FAILED";
  imageUrl?: string;
  cloudinaryPublicId?: string;
  svgSource?: string;
  deletedAt: Date | null;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------QRCODE DOCUMENT-----------------------------
export type QRCodeDocument = HydratedDocument<IQRCode>;

// -----------------------------QRCODE MODEL-----------------------------
type QRCodeModel = mongoose.Model<IQRCode>;

// -----------------------------SCHEMA-----------------------------
const qrCodeSchema = new mongoose.Schema<IQRCode, QRCodeModel>(
  {
    qrId: {
      type: String,
      required: true,
      unique: true,
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    linkedUrlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "URL",
      default: null,
    },

    title: {
      type: String,
      trim: true,
    },

    destinationURL: {
      type: String,
      trim: true,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    isDisabled: {
      type: Boolean,
      default: false,
    },

    design: {
      type: qrDesignSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: ["PENDING", "READY", "FAILED"],
      default: "PENDING",
    },

    svgSource: {
      type: String,
    },

    imageUrl: {
      type: String,
    },

    cloudinaryPublicId: {
      type: String,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const QRCode = mongoose.model<IQRCode, QRCodeModel>("QRCode", qrCodeSchema);

export default QRCode;
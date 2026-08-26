import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";

// -----------------------------URL INTERFACE-----------------------------

export interface IURL {
  shortId: string;
  redirectURL: string;
  createdBy: mongoose.Types.ObjectId;
  expiresAt: Date | null;
  isDisabled: boolean;
  title: string; 
  linkedQRId: mongoose.Types.ObjectId | null;
  deletedAt: Date | null;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;    
  updatedAt: Date;
}

// -----------------------------URL DOCUMENT-----------------------------
export type URLDocument = HydratedDocument<IURL>;

// -----------------------------URL MODEL-----------------------------
type URLModel = mongoose.Model<IURL>;

// -----------------------------SCHEMA-----------------------------

const urlSchema = new mongoose.Schema<IURL, URLModel>(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
    },
    
    redirectURL: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    linkedQRId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QRCode",
      default: null,
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

const URL = mongoose.model<IURL, URLModel>("URL", urlSchema);

export default URL;

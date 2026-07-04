import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";

// -----------------------------URL INTERFACE-----------------------------

export interface IURL {
  shortId: string;
  redirectURL: string;
  createdBy: mongoose.Types.ObjectId;
  expiresAt: Date | null;
}

// -----------------------------URL DOCUMENT-----------------------------
export type URLDocument = HydratedDocument<IURL>;

// -----------------------------URL MODEL-----------------------------
export type URLModel = mongoose.Model<IURL>;

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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    expiresAt: {
     type: Date,
     default: null,
     index: true,
    },
  },
  {
    timestamps: true,
  }
);

const URL = mongoose.model<IURL, URLModel>("URL", urlSchema);

export default URL;

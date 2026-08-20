import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";

// -----------------------------VISIT INTERFACE-----------------------------
export interface IVisit {
  linkId: mongoose.Types.ObjectId;
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

// -----------------------------VISIT DOCUMENT-----------------------------
export type VisitDocument = HydratedDocument<IVisit>;

// -----------------------------VISIT MODEL-----------------------------
type VisitModel = mongoose.Model<IVisit>;

// -----------------------------SCHEMA-----------------------------
const visitSchema = new mongoose.Schema<IVisit, VisitModel>(
  {
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "URL",
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

visitSchema.index({
  linkId: 1,  
  timestamp: -1,  
});

const Visit = mongoose.model<IVisit, VisitModel>("Visit", visitSchema);

export default Visit;

import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";

// -----------------------------VISIT INTERFACE-----------------------------
export interface IVisit {
  linkId: mongoose.Types.ObjectId;
  timestamp: Date;
}

// -----------------------------VISIT DOCUMENT-----------------------------
export type VisitDocument = HydratedDocument<IVisit>;

// -----------------------------VISIT MODEL-----------------------------
export type VisitModel = mongoose.Model<IVisit>;

// -----------------------------SCHEMA-----------------------------
const visitSchema = new mongoose.Schema<IVisit, VisitModel>(
  {
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "URL",
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

visitSchema.index({
  linkId: 1,  //ascending order
  timestamp: -1,  //descending order
});

const Visit = mongoose.model<IVisit, VisitModel>("Visit", visitSchema);

export default Visit;

import mongoose from "mongoose";
import type {
  HydratedDocument,
} from "mongoose";

// -----------------------------URL INTERFACE-----------------------------
export interface IVisitHistory {
  timestamp: number;
}

export interface IURL {
  shortId: string;
  redirectURL: string;

  visitHistory:
    IVisitHistory[];

  createdBy:
    mongoose.Types.ObjectId;
}

// -----------------------------URL DOCUMENT-----------------------------
export type URLDocument =
  HydratedDocument<IURL>;

// -----------------------------URL MODEL-----------------------------
export type URLModel =
  mongoose.Model<IURL>;

// -----------------------------SCHEMA-----------------------------

const urlSchema = new mongoose.Schema<
    IURL,
    URLModel
  >(
  {
    shortId: {
        type: String,
        required: true,
        unique: true
    },
    redirectURL: {
        type: String,
        required: true
    },
    visitHistory: [{
        timestamp: { type: Number}
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

},
    {
        timestamps: true
    })

const URL = mongoose.model<
    IURL,
    URLModel
  >("URL", urlSchema);

export default URL;
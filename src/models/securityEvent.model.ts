import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";

export interface ISecurityEvent {
  event: string;
  email?: string;
  userId?: mongoose.Types.ObjectId;
  ip?: string;
  metadata?: Record<string, unknown>;
}

export type SecurityEventDocument = HydratedDocument<ISecurityEvent>;

type SecurityEventModel = mongoose.Model<ISecurityEvent>;

const securityEventSchema = new mongoose.Schema<ISecurityEvent, SecurityEventModel>(
  {
    event: {
      type: String,
      required: true,
      index: true,
    },

    email: {
      type: String,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    ip: {
      type: String,
      index: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { 
    timestamps: true 
  }
);

const SecurityEvent = mongoose.model<ISecurityEvent, SecurityEventModel>("SecurityEvent", securityEventSchema);

export default SecurityEvent;

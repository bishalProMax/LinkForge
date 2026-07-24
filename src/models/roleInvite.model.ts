import mongoose from "mongoose";
import type { HydratedDocument } from "mongoose";

export interface IRoleInvite {
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  invitedBy: mongoose.Types.ObjectId;
}

export type RoleInviteDocument = HydratedDocument<IRoleInvite>;

type RoleInviteModel = mongoose.Model<IRoleInvite>;

const roleInviteSchema = new mongoose.Schema<IRoleInvite, RoleInviteModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "SUPER_ADMIN"],
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const RoleInvite = mongoose.model<IRoleInvite, RoleInviteModel>("RoleInvite", roleInviteSchema);

export default RoleInvite;

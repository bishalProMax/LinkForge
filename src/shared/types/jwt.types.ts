import mongoose from "mongoose";

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
};

export interface UserPayload {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
};

export interface RefreshSessionRecord {
  userId: string;
  email: string;
  name: string;
  secretHash: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
}

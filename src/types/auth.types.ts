import mongoose from "mongoose";

export type TokenPayload = {
  id: string;
  email: string;
};

export type UserPayload = {
  _id: mongoose.Types.ObjectId;
  email: string;
};

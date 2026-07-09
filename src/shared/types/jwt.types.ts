import mongoose from "mongoose";

export type TokenPayload = {
  id: string;
  email: string;
  name: string;
};

export type UserPayload = {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
};

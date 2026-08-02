import User, { UserDocument } from "../../models/user.model.js";
import type { CreateUserData } from "./user.types.js";

const findUserByEmail = (email: string) => {
  return User.findOne({ email }).select("+password");;
};

const createUser = (data: CreateUserData) => {
  return User.create(data);
};

const findUserByVerificationToken = (token: string) => {
  return User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: {
      $gt: new Date()
    },
  });
};

const saveUser = (user: UserDocument) => {
  return user.save();
};

const findUserById = (id: string) => {
  return User.findById(id);
};

const setUserBannedStatus = (userId: string, isBanned: boolean) => {
  return User.findByIdAndUpdate(userId, { isBanned }, { returnDocument: "after" });
};

const updateUserRole = (userId: string, role: "ADMIN" | "SUPER_ADMIN") => {
  return User.findByIdAndUpdate(userId, { role }, { returnDocument: "after" });
};

export { 
  findUserByEmail, 
  createUser, 
  findUserByVerificationToken, 
  saveUser,
  findUserById,
  setUserBannedStatus,
  updateUserRole,
  };

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

export { 
  findUserByEmail, 
  createUser, 
  findUserByVerificationToken, 
  saveUser 
};

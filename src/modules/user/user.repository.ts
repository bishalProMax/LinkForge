import User, { UserDocument } from "../../models/user.model.js";
import RoleInvite from "../../models/roleInvite.model.js";
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

const findRoleInviteByEmail = (email: string) => {
  return RoleInvite.findOne({ email });
};

const createRoleInvite = (email: string, role: "ADMIN" | "SUPER_ADMIN", invitedById: string) => {
  return RoleInvite.create({ email, role, invitedBy: invitedById });
};

const deleteRoleInviteByEmail = (email: string) => {
  return RoleInvite.deleteOne({ email });
};

export { 
  findUserByEmail, 
  createUser, 
  findUserByVerificationToken, 
  saveUser,
  findUserById,
  findRoleInviteByEmail,
  createRoleInvite,
  deleteRoleInviteByEmail
};

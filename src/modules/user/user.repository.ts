import User, { UserDocument } from "../../models/user.model.js";
import RoleInvite from "../../models/roleInvite.model.js";
import type { CreateUserData, AdminUserListItem } from "./user.types.js";


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

const findRoleInviteByEmail = (email: string) => {
  return RoleInvite.findOne({ email });
};

const createRoleInvite = (email: string, role: "ADMIN" | "SUPER_ADMIN", invitedById: string) => {
  return RoleInvite.create({ email, role, invitedBy: invitedById });
};

const deleteRoleInviteByEmail = (email: string) => {
  return RoleInvite.deleteOne({ email });
};


const getAllUsers = async (actingUserRole: "ADMIN" | "SUPER_ADMIN",page: number,limit: number): Promise<{ data: AdminUserListItem[]; total: number }> => {
  const filter = actingUserRole === "ADMIN" ? { role: "USER" } : {};

  const [data, total] = await Promise.all([
    User.find(filter)
      .select("name email role isBanned createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return { data: data as unknown as AdminUserListItem[], total };
};

export { 
  findUserByEmail, 
  createUser, 
  findUserByVerificationToken, 
  saveUser,
  findUserById,
  findRoleInviteByEmail,
  createRoleInvite,
  deleteRoleInviteByEmail,
  setUserBannedStatus,
  updateUserRole,
  getAllUsers,

};

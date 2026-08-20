import User from "../../models/user.model.js";
import RoleInvite from "../../models/roleInvite.model.js";
import type { AdminUserListItem } from "./admin.types.js";

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

const searchUsersByQuery = (query: string, actingUserRole: "ADMIN" | "SUPER_ADMIN", limit = 8) => {
  const roleFilter = actingUserRole === "ADMIN" ? { role: "USER" } : {};

  return User.find({
    ...roleFilter,
    $or: [{ name: { $regex: query, $options: "i" } }, { email: { $regex: query, $options: "i" } }],
  })
    .select("name email role")
    .limit(limit)
    .lean();
};

export { 
findRoleInviteByEmail,
  createRoleInvite,
  deleteRoleInviteByEmail,
  getAllUsers,
  searchUsersByQuery
  }
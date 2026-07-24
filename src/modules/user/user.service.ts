import { findUserByEmail, findRoleInviteByEmail, createRoleInvite, findUserById, setUserBannedStatus, updateUserRole, getAllUsers as getAllUsersRepo } from "./user.repository.js";
import { revokeAllUserSessions } from "../../shared/services/jwt.service.js";
import { logSecurityEvent } from "../../shared/services/securityLogger.service.js";
import type { CreateInviteProps, CreateInviteResult, BanActionProps, BanActionResult, RoleChangeActionProps, RoleChangeActionResult, GetAllUsersProps, AdminUserListItem } from "./user.types.js";
import emailQueue from "../../infrastructure/queues/email.queue.js";

const createInvite = async ({ email, role, invitedById, invitedByName }: CreateInviteProps): Promise<CreateInviteResult> => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return { type: "EMAIL_ALREADY_REGISTERED" };
  }

  const existingInvite = await findRoleInviteByEmail(email);
  if (existingInvite) {
    return { type: "INVITE_ALREADY_EXISTS" };
  }

  await createRoleInvite(email, role, invitedById);
  logSecurityEvent({ event: "ROLE_INVITE_CREATED", email, invitedById, role }, "info");
  await emailQueue.add("sendRoleInviteEmail", {
    email,
    role,
    invitedByName,
    signupLink: `${process.env.BASE_URL}/signup`,
  });

  return { type: "SUCCESS" };
};

const banUser = async ({ targetUserId, actingUser }: BanActionProps): Promise<BanActionResult> => {
  if (targetUserId === actingUser.id) {
    return { type: "SELF_BAN_FORBIDDEN" };
  }

  const target = await findUserById(targetUserId);
  if (!target) {
    return { type: "NOT_FOUND" };
  }

  const authorized =
    (actingUser.role === "ADMIN" && target.role === "USER") ||
    (actingUser.role === "SUPER_ADMIN" && (target.role === "ADMIN" || target.role === "SUPER_ADMIN"));

  if (!authorized) {
    return { type: "INSUFFICIENT_AUTHORITY" };
  }

  if (target.isBanned) {
    return { type: "ALREADY_IN_STATE" };
  }

  await setUserBannedStatus(targetUserId, true);
  await revokeAllUserSessions(targetUserId);

  logSecurityEvent({ event: "USER_BANNED", userId: targetUserId, email: target.email, actingUserId: actingUser.id }, "info");

  return { type: "SUCCESS" };
};

const unbanUser = async ({ targetUserId, actingUser }: BanActionProps): Promise<BanActionResult> => {
  const target = await findUserById(targetUserId);
  if (!target) {
    return { type: "NOT_FOUND" };
  }

  const authorized =
    (actingUser.role === "ADMIN" && target.role === "USER") ||
    (actingUser.role === "SUPER_ADMIN" && (target.role === "ADMIN" || target.role === "SUPER_ADMIN"));

  if (!authorized) {
    return { type: "INSUFFICIENT_AUTHORITY" };
  }

  if (!target.isBanned) {
    return { type: "ALREADY_IN_STATE" };
  }

  await setUserBannedStatus(targetUserId, false);

  logSecurityEvent({ event: "USER_UNBANNED", userId: targetUserId, email: target.email, actingUserId: actingUser.id }, "info");

  return { type: "SUCCESS" };
};

const promoteToSuperAdmin = async ({ targetUserId, actingUser }: RoleChangeActionProps): Promise<RoleChangeActionResult> => {
  if (actingUser.role !== "SUPER_ADMIN") {
    return { type: "INSUFFICIENT_AUTHORITY" };
  }

  const target = await findUserById(targetUserId);
  if (!target) {
    return { type: "NOT_FOUND" };
  }

  if (target.role !== "ADMIN") {
    return { type: "INVALID_TARGET_ROLE" };
  }

  await updateUserRole(targetUserId, "SUPER_ADMIN");

  logSecurityEvent({ event: "ROLE_PROMOTED", userId: targetUserId, email: target.email, actingUserId: actingUser.id, from: "ADMIN", to: "SUPER_ADMIN" }, "info");

  return { type: "SUCCESS" };
};

const demoteToAdmin = async ({ targetUserId, actingUser }: RoleChangeActionProps): Promise<RoleChangeActionResult> => {
  if (actingUser.role !== "SUPER_ADMIN") {
    return { type: "INSUFFICIENT_AUTHORITY" };
  }

  const target = await findUserById(targetUserId);
  if (!target) {
    return { type: "NOT_FOUND" };
  }

  if (target.role !== "SUPER_ADMIN") {
    return { type: "INVALID_TARGET_ROLE" };
  }

  await updateUserRole(targetUserId, "ADMIN");

  logSecurityEvent({ event: "ROLE_DEMOTED", userId: targetUserId, email: target.email, actingUserId: actingUser.id, from: "SUPER_ADMIN", to: "ADMIN" }, "info");

  return { type: "SUCCESS" };
};

const getAllUsers = async ({ actingUserRole, page, limit }: GetAllUsersProps): Promise<{ data: AdminUserListItem[]; total: number }> => {
  return getAllUsersRepo(actingUserRole, page, limit);
};

export { 
  createInvite, 
  banUser, 
  unbanUser, 
  promoteToSuperAdmin, 
  demoteToAdmin, 
  getAllUsers 
  };
import mongoose from "mongoose";
import emailQueue from "../../infrastructure/queues/email.queue.js";
import { findUserById, findUserByEmail, saveUser, setDeletionRequestedAt  } from "./user.repository.js";
import { revokeAllUserSessions, revokeRefreshSession, createToken, createRefreshSession } from "../../shared/services/jwt.service.js";
import { logSecurityEvent } from "../../shared/services/securityLogger.service.js";
import type { UserPayload } from "../../shared/types/jwt.types.js";
import type { UpdateUsernameResult, ChangePasswordResult, UpdateDetailsResult, RequestAccountDeletionResult } from "./user.types.js";

// -----------------------------UPDATE USERNAME-----------------------------
const updateUsername = async (userId: string, name: string): Promise<UpdateUsernameResult> => {
  const user = await findUserById(userId);
  if (!user) {
    return { type: "NOT_FOUND" };
  }

  user.name = name;
  await saveUser(user);

  logSecurityEvent({ event: "PROFILE_USERNAME_CHANGED", userId, email: user.email, role: user.role }, "info");

  const payload: UserPayload = { _id: user._id, email: user.email, name: user.name, role: user.role };
  const accessToken = createToken(payload);

  return { type: "SUCCESS", name: user.name, accessToken };
};

// -----------------------------CHANGE PASSWORD-----------------------------
const changePassword = async (userId: string, email: string, oldPassword: string | undefined, newPassword: string): Promise<ChangePasswordResult> => {
  const user = await findUserByEmail(email);
  if (!user) {
    return { type: "NOT_FOUND" };
  }

  const hasLocalAuth = user.authProviders.includes("local");

  if (hasLocalAuth) {
    if (!oldPassword) {
      return { type: "OLD_PASSWORD_REQUIRED" };
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return { type: "INVALID_OLD_PASSWORD" };
    }
  } else {
    user.authProviders.push("local");
  }

  user.password = newPassword;
  await saveUser(user);

  await revokeAllUserSessions(userId);

  logSecurityEvent({ event: "PROFILE_PASSWORD_CHANGED", userId, email, role: user.role }, "info");

  const payload: UserPayload = { _id: user._id, email: user.email, name: user.name, role: user.role };
  const accessToken = createToken(payload);
  const refreshToken = await createRefreshSession(payload);

  return { type: "SUCCESS", accessToken, refreshToken };
};

// -----------------------------UPDATE DETAILS-----------------------------
const updateDetails = async (userId: string, organization?: string, designation?: string): Promise<UpdateDetailsResult> => {
  const user = await findUserById(userId);
  if (!user) {
    return { type: "NOT_FOUND" };
  }

  user.organization = organization;
  user.designation = designation;
  await saveUser(user);

  return { type: "SUCCESS", organization: user.organization, designation: user.designation };
};

// ---------------------------- ACCOUNT DELETION --------------------------
const requestAccountDeletion = async (userId: string, username: string, email: string, role: "USER"| "ADMIN" | "SUPER_ADMIN" , ip: string, refreshCookie?: string): Promise<RequestAccountDeletionResult> => {
  
  const ACCOUNT_DELETION_GRACE_DAYS = 30;
  if (role !== "USER") {
    return { type: "NOT_ALLOWED_FOR_ROLE" };
  }

  await setDeletionRequestedAt(userId, new Date());

  if (refreshCookie) {
    await revokeRefreshSession(refreshCookie);
  }

  logSecurityEvent({ event: "ACCOUNT_DELETION_REQUESTED", userId, email, ip, role }, "warn");

  const deletionDate = new Date(Date.now() + ACCOUNT_DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  await emailQueue.add("sendAccountDeletionWarningEmail", {
    email,
    name: username, 
    deletionDate,
    loginLink: `${process.env.BASE_URL}/login`,
  });

  return { type: "SUCCESS" };
};

// ---------------------------- CANCEL ACCOUNT DELETION -------------------
const cancelPendingDeletionIfSet = async ( user: { _id: mongoose.Types.ObjectId ; deletionRequestedAt?: Date | null; email: string; role: "USER" | "ADMIN" | "SUPER_ADMIN" },ip: string): Promise<void> => {

  if (!user.deletionRequestedAt) return;

  const userId = user._id.toString()

  await setDeletionRequestedAt(userId, null);
  logSecurityEvent({ event: "ACCOUNT_DELETION_CANCELLED", userId, email: user.email, ip, role: user.role }, "info");
};

export { 
    updateUsername, 
    changePassword, 
    updateDetails,
    requestAccountDeletion,
    cancelPendingDeletionIfSet
    };
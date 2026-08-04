import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../../shared/utils/cookieOptions.js";
import { findUserById } from "./user.repository.js";
import { updateUsername, changePassword, updateDetails } from "./user.service.js";
import { usernameSchema, changePasswordSchema, updateDetailsSchema, deleteAccountSchema } from "./user.schemas.js";

// -----------------------------SHOW PROFILE PAGE-----------------------------
const handleShowProfilePage = asyncHandler(async (req: Request, res: Response) => {
  const user = await findUserById(req.user!.id);

  if (!user) {
    return res.redirect("/login");
  }

  return res.render("profile", {
    name: user.name,
    email: user.email,
    organization: user.organization || "",
    designation: user.designation || "",
    hasLocalAuth: user.authProviders.includes("local"),
    role: user.role,
  });
});

// -----------------------------UPDATE USERNAME-----------------------------
const handleUpdateUsername = asyncHandler(async (req: Request, res: Response) => {
  const parsed = usernameSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" });
  }

  const result = await updateUsername(req.user!.id, parsed.data.name);

  if (result.type === "NOT_FOUND") {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.cookie("accessToken", result.accessToken as string, accessTokenCookieOptions);

  return res.status(200).json({ success: true, message: "Username updated successfully.", name: result.name });
});

// -----------------------------CHANGE PASSWORD-----------------------------
const handleChangePassword = asyncHandler(async (req: Request, res: Response) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" });
  }

  const result = await changePassword(req.user!.id, req.user!.email, parsed.data.oldPassword, parsed.data.newPassword);

  if (result.type === "NOT_FOUND") {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (result.type === "OLD_PASSWORD_REQUIRED") {
    return res.status(400).json({ success: false, message: "Please enter your current password." });
  }

  if (result.type === "INVALID_OLD_PASSWORD") {
    return res.status(401).json({ success: false, message: "Current password is incorrect." });
  }

  res.cookie("accessToken", result.accessToken as string, accessTokenCookieOptions);
  res.cookie("refreshToken", result.refreshToken as string, refreshTokenCookieOptions);

  return res.status(200).json({ success: true, message: "Password updated successfully. Other devices have been signed out." });
});

// -----------------------------UPDATE DETAILS-----------------------------
const handleUpdateDetails = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateDetailsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" });
  }

  const result = await updateDetails(req.user!.id, parsed.data.organization, parsed.data.designation);

  if (result.type === "NOT_FOUND") {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Details updated successfully.",
    organization: result.organization ?? "",
    designation: result.designation ?? "",
  });
});

// -----------------------------DELETE ACCOUNT (STUB)-----------------------------
const handleDeleteAccountStub = asyncHandler(async (req: Request, res: Response) => {
  const parsed = deleteAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Please type CONFIRM DELETE exactly to proceed." });
  }

  // TODO: implement actual account deletion logic here (cascade delete URLs, visits, sessions, etc.)
  return res.status(501).json({ success: false, message: "Account deletion is not implemented yet." });
});

export {
  handleShowProfilePage,
  handleUpdateUsername,
  handleChangePassword,
  handleUpdateDetails,
  handleDeleteAccountStub,
};
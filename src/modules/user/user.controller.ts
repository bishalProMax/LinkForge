import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../../shared/utils/cookieOptions.js";
import { findUserById } from "./user.repository.js";
import { updateUsername, changePassword, updateDetails, requestAccountDeletion } from "./user.service.js";

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
  const result = await updateUsername(req.user!.id, req.body.name);

  if (result.type === "NOT_FOUND") {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.cookie("accessToken", result.accessToken as string, accessTokenCookieOptions);

  return res.status(200).json({ success: true, message: "Username updated successfully.", name: result.name });
});

// -----------------------------CHANGE PASSWORD-----------------------------
const handleChangePassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await changePassword(req.user!.id, req.user!.email, req.body.oldPassword, req.body.newPassword);

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
  const result = await updateDetails(req.user!.id, req.body.organization, req.body.designation);

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

// -----------------------------REQUEST ACCOUNT DELETION-----------------------------
const handleRequestAccountDeletion = asyncHandler(async (req: Request, res: Response) => {
  const result = await requestAccountDeletion(req.user!.id, req.user!.name, req.user!.email, req.user!.role, req.ip ?? "", req.cookies?.refreshToken);

  if (result.type === "NOT_ALLOWED_FOR_ROLE") {
    return res.status(403).json({ success: false, message: "Admin and Super Admin accounts cannot be self-deleted through this flow." });
  }

  res.clearCookie("accessToken", accessTokenCookieOptions);
  res.clearCookie("refreshToken", refreshTokenCookieOptions);

  return res.status(200).json({ success: true, message: "Your account is scheduled for deletion in 30 days. Logging back in before then cancels it." });
});

export {
  handleShowProfilePage,
  handleUpdateUsername,
  handleChangePassword,
  handleUpdateDetails,
  handleRequestAccountDeletion,
};
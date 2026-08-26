import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { createInvite, banUser, unbanUser, promoteToSuperAdmin, demoteToAdmin, getAllUsers, searchUsers } from "./admin.service.js";
import { QRByIdAdmin } from "../qr/qr.service.js";
import { URLByShortIdAdmin } from "../url/url.service.js"

const handleCreateRoleInvite = asyncHandler(async (req: Request, res: Response) => {
  const { email, role } = req.body;

  const result = await createInvite({
    email,
    role,
    invitedById: req.user!.id,
    invitedByName: req.user!.name,
  });

  if (result.type === "EMAIL_ALREADY_REGISTERED") {
    return res.status(409).redirect("/admin/invites?error=" + encodeURIComponent("This email is already registered as a user."));
  }

  if (result.type === "INVITE_ALREADY_EXISTS") {
    return res.status(409).redirect("/admin/invites?error=" + encodeURIComponent("An invite has already been sent to this email."));
  }

  return res.redirect("/admin/invites?success=true");
});

const handleBanUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await banUser({
    targetUserId: req.params.userId as string,
    actingUser: { id: req.user!.id, role: req.user!.role },
  });

  if (result.type !== "SUCCESS") {
    const messages: Record<string, string> = {
      NOT_FOUND: "User not found.",
      SELF_BAN_FORBIDDEN: "You cannot ban your own account.",
      INSUFFICIENT_AUTHORITY: "You don't have permission to ban this account.",
      ALREADY_IN_STATE: "This account is already banned.",
    };
    return res.redirect("/admin/users?error=" + encodeURIComponent(messages[result.type]));
  }

  return res.redirect("/admin/users?success=" + encodeURIComponent("User banned successfully."));
});

const handleUnbanUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await unbanUser({
    targetUserId: req.params.userId as string,
    actingUser: { id: req.user!.id, role: req.user!.role },
  });

  if (result.type !== "SUCCESS") {
    const messages: Record<string, string> = {
      NOT_FOUND: "User not found.",
      INSUFFICIENT_AUTHORITY: "You don't have permission to unban this account.",
      ALREADY_IN_STATE: "This account is not banned.",
    };
    return res.redirect("/admin/users?error=" + encodeURIComponent(messages[result.type]));
  }

  return res.redirect("/admin/users?success=" + encodeURIComponent("User unbanned successfully."));
});

const handlePromoteUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await promoteToSuperAdmin({
    targetUserId: req.params.userId as string,
    actingUser: { id: req.user!.id, role: req.user!.role },
  });

  if (result.type !== "SUCCESS") {
    const messages: Record<string, string> = {
      NOT_FOUND: "User not found.",
      INVALID_TARGET_ROLE: "Only an Admin can be promoted to Super Admin.",
      INSUFFICIENT_AUTHORITY: "You don't have permission to promote this account.",
    };
    return res.redirect("/admin/users?error=" + encodeURIComponent(messages[result.type]));
  }

  return res.redirect("/admin/users?success=" + encodeURIComponent("User promoted to Super Admin."));
});

const handleDemoteUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await demoteToAdmin({
    targetUserId: req.params.userId as string,
    actingUser: { id: req.user!.id, role: req.user!.role },
  });

  if (result.type !== "SUCCESS") {
    const messages: Record<string, string> = {
      NOT_FOUND: "User not found.",
      INVALID_TARGET_ROLE: "Only a Super Admin can be demoted to Admin.",
      INSUFFICIENT_AUTHORITY: "You don't have permission to demote this account.",
    };
    return res.redirect("/admin/users?error=" + encodeURIComponent(messages[result.type]));
  }

  return res.redirect("/admin/users?success=" + encodeURIComponent("User demoted to Admin."));
});

const handleGetAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = 10;

  const { data: users, total } = await getAllUsers({
    actingUserRole: req.user!.role as "ADMIN" | "SUPER_ADMIN",
    page,
    limit,
  });

  const totalPages = Math.ceil(total / limit);
  const error = typeof req.query.error === "string" ? req.query.error : null;
  const success = typeof req.query.success === "string" ? req.query.success : null;

  return res.render("adminUsers", { users,currentPage: page,totalPages,total,error,success,actingUserId: req.user!.id,actingUserRole: req.user!.role });
});

const handleSearchUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (!query) {
    return res.status(200).json({ success: true, users: [] });
  }

  const users = await searchUsers(query, req.user!.role as "ADMIN" | "SUPER_ADMIN");
  return res.status(200).json({ success: true, users });
});

//get soft deleted links too in links page
const handleGetLinkAdmin = asyncHandler(async (req: Request, res: Response) => {
  const url = await URLByShortIdAdmin(req.params.shortId as string);

  if (!url) {
    return res.status(404).json({ success: false, message: "Link not found." });
  }

  return res.status(200).json({ success: true, url });
});

///get soft deleted QR too in QR page
const handleGetQRAdmin = asyncHandler(async (req: Request, res: Response) => {
  const qr = await QRByIdAdmin(req.params.qrId as string);

  if (!qr) {
    return res.status(404).json({ success: false, message: "QR code not found." });
  }

  return res.status(200).json({ success: true, qr });
});

export { 
  handleCreateRoleInvite, 
  handleBanUser, 
  handleUnbanUser, 
  handlePromoteUser, 
  handleDemoteUser, 
  handleGetAllUsers,
  handleSearchUsers,
  handleGetLinkAdmin,
  handleGetQRAdmin
  };


import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { createInvite } from "./user.service.js";

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

export { handleCreateRoleInvite };

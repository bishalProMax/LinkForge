import { Router } from "express";
import { handleCreateRoleInvite } from "./user.controller.js";
import { createInviteSchema } from "./user.schemas.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";
import { validateRedirect } from "../../shared/middlewares/validation.middleware.js";
import requireRole from "../../shared/middlewares/roleGuard.middleware.js";

const router = Router();

router.route("/invites").post(authenticateUser,requireRole("SUPER_ADMIN"),validateRedirect(createInviteSchema, { redirectPath: "/admin/invites" }),handleCreateRoleInvite);

export default router;
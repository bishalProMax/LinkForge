import { Router } from "express";
import { handleCreateRoleInvite, handleBanUser, handleUnbanUser, handlePromoteUser, handleDemoteUser, handleGetAllUsers } from "./user.controller.js";
import { createInviteSchema } from "./user.schemas.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";
import { validateRedirect } from "../../shared/middlewares/validation.middleware.js";
import requireRole from "../../shared/middlewares/roleGuard.middleware.js";

const router = Router();

router.route("/invites").post(authenticateUser, requireRole("SUPER_ADMIN"), validateRedirect(createInviteSchema, { redirectPath: "/admin/invites" }), handleCreateRoleInvite);

router.route("/users").get(authenticateUser, requireRole("ADMIN", "SUPER_ADMIN"), handleGetAllUsers);

router.route("/users/:userId/ban").post(authenticateUser, requireRole("ADMIN", "SUPER_ADMIN"), handleBanUser);
router.route("/users/:userId/unban").post(authenticateUser, requireRole("ADMIN", "SUPER_ADMIN"), handleUnbanUser);

router.route("/users/:userId/promote").post(authenticateUser, requireRole("SUPER_ADMIN"), handlePromoteUser);
router.route("/users/:userId/demote").post(authenticateUser, requireRole("SUPER_ADMIN"), handleDemoteUser);

export default router;
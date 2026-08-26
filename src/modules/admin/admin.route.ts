import { Router } from "express";
import { handleCreateRoleInvite, handleBanUser, handleUnbanUser, handlePromoteUser, handleDemoteUser, handleGetAllUsers, handleSearchUsers, handleGetLinkAdmin, handleGetQRAdmin } from "./admin.controller.js";
import { handleGetAuditReport, handleExportAuditCSV } from "./report.controller.js";
import { createInviteSchema } from "./admin.schemas.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";
import { validateRedirect } from "../../shared/middlewares/validation.middleware.js";
import requireRole from "../../shared/middlewares/roleGuard.middleware.js";

const router = Router();

//invite route
router.route("/invites").post(authenticateUser, requireRole("SUPER_ADMIN"), validateRedirect(createInviteSchema, { redirectPath: "/admin/invites" }), handleCreateRoleInvite);

//users check routes
router.route("/users").get(authenticateUser, requireRole("ADMIN", "SUPER_ADMIN"), handleGetAllUsers);

//ban/unban routes
router.route("/users/:userId/ban").post(authenticateUser, requireRole("ADMIN", "SUPER_ADMIN"), handleBanUser);
router.route("/users/:userId/unban").post(authenticateUser, requireRole("ADMIN", "SUPER_ADMIN"), handleUnbanUser);

//promote/demote routes
router.route("/users/:userId/promote").post(authenticateUser, requireRole("SUPER_ADMIN"), handlePromoteUser);
router.route("/users/:userId/demote").post(authenticateUser, requireRole("SUPER_ADMIN"), handleDemoteUser);

//reports route
router.route("/reports").get(authenticateUser, requireRole("ADMIN", "SUPER_ADMIN"), handleGetAuditReport);

//export reports route
router.route("/reports/export").get(authenticateUser, requireRole("ADMIN", "SUPER_ADMIN"), handleExportAuditCSV);

router.route("/users/search").get(authenticateUser, requireRole("ADMIN", "SUPER_ADMIN"), handleSearchUsers);

router.route("/links/:shortId").get(authenticateUser, requireRole("ADMIN", "SUPER_ADMIN"), handleGetLinkAdmin);

router.route("/qr/:qrId").get(authenticateUser, requireRole("ADMIN", "SUPER_ADMIN"), handleGetQRAdmin);

export default router;
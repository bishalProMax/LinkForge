import { Router } from "express";
import {handleCreateStandaloneQR, handleCreateLinkedQR, handleLinkQRToNewUrl, handleGetQRStatus, handleRedirectQR, handleToggleDisableQR, handleDeleteQR, handleGetQRAnalytics, handleDownloadQRAsset } from "./qr.controller.js";
import { createStandaloneQRSchema } from "./qr.schemas.js";
import { validateRedirect } from "../../shared/middlewares/validation.middleware.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";

const router = Router();

// Create standalone QR
router.route("/generate").post(authenticateUser, validateRedirect(createStandaloneQRSchema, { redirectPath: "/qr" }), handleCreateStandaloneQR);

// Create QR linked to an existing URL (dashboard action menu)
router.route("/from-url/:urlId").post(authenticateUser, handleCreateLinkedQR);

// Link a standalone QR to a brand-new short URL
router.route("/:qrId/link").post(authenticateUser, handleLinkQRToNewUrl);

// Poll generation status
router.route("/:qrId/status").get(authenticateUser, handleGetQRStatus);

// Disable / delete
router.route("/:qrId/disable").patch(authenticateUser, handleToggleDisableQR);
router.route("/:qrId/download/:format").get(authenticateUser, handleDownloadQRAsset);
router.route("/:qrId").delete(authenticateUser, handleDeleteQR);

// Public redirect — logs scans, never touches URL click counts
router.route("/:qrId").get(handleRedirectQR);


router.route("/:qrId/analytics").get(authenticateUser, handleGetQRAnalytics);

export default router;

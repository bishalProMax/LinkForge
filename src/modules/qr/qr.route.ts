import { Router } from "express";
import {handleCreateStandaloneQR, handleLinkQRToNewUrl, handleGetQRStatus, handleRedirectQR, handleToggleDisableQR, handleDeleteQR, handleDownloadQRAsset, handleShowEditQRPage, handleEditQR, handleUpdateQRDesign, handlePreviewQRDesign } from "./qr.controller.js";
import { createStandaloneQRSchema, editQRSchema, updateDesignSchema } from "./qr.schemas.js";
import { validateRedirectDynamic, validateJSON } from "../../shared/middlewares/validation.middleware.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";

const router = Router();

// Create standalone QR
router.route("/generate").post(authenticateUser, validateJSON(createStandaloneQRSchema), handleCreateStandaloneQR);

// Link a standalone QR to a brand-new short URL
router.route("/:qrId/link").post(authenticateUser, handleLinkQRToNewUrl);

// Poll generation status
router.route("/:qrId/status").get(authenticateUser, handleGetQRStatus);

// edit page
router.route("/:qrId/edit").get(authenticateUser, handleShowEditQRPage).post(authenticateUser,validateRedirectDynamic(editQRSchema, "qrId", "/qr"), handleEditQR);

//edit design
router.route("/:qrId/design").patch(authenticateUser, validateJSON(updateDesignSchema), handleUpdateQRDesign);

// Disable 
router.route("/:qrId/disable").patch(authenticateUser, handleToggleDisableQR);

//download asset
router.route("/:qrId/download/:format").get(authenticateUser, handleDownloadQRAsset);

// delete
router.route("/:qrId").delete(authenticateUser, handleDeleteQR);

// Public redirect — logs scans, never touches URL click counts
router.route("/:qrId").get(handleRedirectQR);

// PREVIEW QR CHANGES
router.route("/preview").post(authenticateUser, handlePreviewQRDesign);

export default router;

import { Router } from "express";
import { handleBulkLinkUpload, handleBulkQRUpload, handleGetBulkStatus, handleExportBulkResults } from "./bulk.controller.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";
import { csvUpload } from "../../shared/middlewares/upload.middleware.js";

const router = Router();

router.route("/links").post(authenticateUser, csvUpload.single("file"), handleBulkLinkUpload);

router.route("/qr").post(authenticateUser, csvUpload.single("file"), handleBulkQRUpload);

router.route("/:operationId/status").get(authenticateUser, handleGetBulkStatus);

router.route("/:operationId/export").get(authenticateUser, handleExportBulkResults);

export default router;
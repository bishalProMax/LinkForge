import { Router } from "express";
import { handleBulkLinkUpload, handleBulkQRUpload, handleGetBulkStatus, handleExportBulkResults, handleDownloadSampleCsv, handleCheckQRReadiness } from "./bulk.controller.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";
import { csvUpload } from "../../shared/middlewares/upload.middleware.js";

const router = Router();

router.route("/links").post(authenticateUser, csvUpload.single("file"), handleBulkLinkUpload);

router.route("/qr").post(authenticateUser, csvUpload.single("file"), handleBulkQRUpload);

router.route("/:operationId/status").get(authenticateUser, handleGetBulkStatus);

router.route("/:operationId/export").get(authenticateUser, handleExportBulkResults);

router.route("/sample/:type.csv").get(handleDownloadSampleCsv); 

router.route("/:operationId/qr-readiness").get(authenticateUser, handleCheckQRReadiness);

export default router;
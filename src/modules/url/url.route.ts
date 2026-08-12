import { Router } from "express";
import { handleGenerateShortURL, handleRedirectToURL, handleGetAnalytics, handleDeleteURL, handleToggleDisableURL, handleCreateQRForURL, handleShowEditLinkPage, handleEditURL } from "./url.controller.js";
import { createUrlSchema, editUrlSchema } from "./url.schemas.js";
import { validateRedirect, validateRedirectDynamic } from "../../shared/middlewares/validation.middleware.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";

const router = Router();

//IT GENERATE SHORT URL
router.route("/generate").post(authenticateUser, validateRedirect(createUrlSchema, { redirectPath: "/dashboard" }), handleGenerateShortURL);

//IT REDIRECT OR DELETE THE URL BASED ON SHORT ID
router.route("/:shortId").get(handleRedirectToURL).delete(authenticateUser, handleDeleteURL);;

//GENERATE THE ANALYTICS OF URL
router.route("/analytics/:shortId").get(authenticateUser, handleGetAnalytics);

//TOGGLE DISABLE URL
router.route("/:shortId/disable").patch(authenticateUser, handleToggleDisableURL);

//CREATE QR FOR A EXISTING SHORT URL
router.route("/:shortId/create-qr").post(authenticateUser, handleCreateQRForURL);

//EDIT LINK PAGE
router.route("/:shortId/edit").get(authenticateUser, handleShowEditLinkPage).post(authenticateUser, validateRedirectDynamic(editUrlSchema, "shortId", "/url"), handleEditURL);

export default router;

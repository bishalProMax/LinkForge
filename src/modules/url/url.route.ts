import { Router } from "express";
import { handleGenerateShortURL, handleRedirectToURL, handleGetAnalytics, handleDeleteURL } from "./url.controller.js";
import { createUrlSchema } from "./url.schemas.js";
import { validateRedirect } from "../../shared/middlewares/validation.middleware.js";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";

const router = Router();

//IT GENERATE SHORT URL
router.route("/generate").post(authenticateUser, validateRedirect(createUrlSchema, { redirectPath: "/dashboard" }), handleGenerateShortURL);

//IT REDIRECT OR DELETE THE URL BASED ON SHORT ID
router.route("/:shortId").get(handleRedirectToURL).delete(authenticateUser, handleDeleteURL);;

//GENERATE THE ANALYTICS OF URL
router.route("/analytics/:shortId").get(authenticateUser, handleGetAnalytics);

export default router;

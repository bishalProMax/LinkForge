import { Router } from "express";
import {handleGenerateShortURL, handleRedirectToURL, handleGetAnalytics} from "./url.controller.js"
import { createUrlSchema } from "./url.schemas.js";
import { validateRedirect } from "../../shared/middlewares/validation.middleware.js";

const router = Router();

//IT GENERATE SHORT URL
router.route("/generate").post(validateRedirect(createUrlSchema, { redirectPath: "/dashboard" }), handleGenerateShortURL);

//IT REDIRECT TO THE URL CREATED
router.route("/:shortId").get(handleRedirectToURL);

//GENERATE THE ANALYTICS OF URL
router.route("/analytics/:shortId").get(handleGetAnalytics);


export default router;
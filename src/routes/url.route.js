import { Router } from "express";
import {handleGenerateNewShortURL, handleRedirectToURL, handleGetAnalytics} from "../controllers/url.controller.js"

const router = Router();

//IT GENERATE SHORT URL
router.route("/generate").post(handleGenerateNewShortURL);

//IT REDIRECT TO THE URL CREATED
router.route("/:shortId").get(handleRedirectToURL);

//GENERATE THE ANALYTICS OF URL
router.route("/analytics/:shortId").get(handleGetAnalytics);


export default router;
import { Router } from "express";
import { handleGetAllURL } from "../controllers/url.controller.js";
import { handleShowSignupPage, handleShowLoginPage,handleShowForgotPasswordPage, handleShowLandingPage, handleShowTermsPage, handleShowPrivacyPage, handleShowAboutPage} from "../controllers/static.controller.js";
import { authenticateUser, redirectIfAuthenticated } from "../middlewares/auth.middleware.js";


const router = Router()

//SSR
router.route("/").get(handleShowLandingPage);

router.route("/linkforge").get(authenticateUser,handleGetAllURL)

router.route("/signup").get(redirectIfAuthenticated, handleShowSignupPage)

router.route("/login").get(redirectIfAuthenticated, handleShowLoginPage)

router.route("/forgot-password").get(handleShowForgotPasswordPage);

router.route("/privacy").get(handleShowPrivacyPage);

router.route("/terms").get(handleShowTermsPage);

router.route("/about").get(handleShowAboutPage);

export default router;
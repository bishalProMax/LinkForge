import { Router } from "express";
import { handleGetAllURL } from "../url/url.controller.js";
import { handleShowProfilePage } from "../user/user.controller.js";
import { handleShowSignupPage, handleShowLoginPage,handleShowForgotPasswordPage, handleShowLandingPage, handleShowTermsPage, handleShowPrivacyPage, handleShowAboutPage, handleShowAccountBannedPage} from "./page.controller.js";
import { authenticateUser, redirectIfAuthenticated } from "../../shared/middlewares/auth.middleware.js";
import { handleGetAllQRs } from "../qr/qr.controller.js";


const router = Router()

//SSR
router.route("/").get(handleShowLandingPage);

router.route("/qr").get(authenticateUser, handleGetAllQRs) 

router.route("/dashboard").get(authenticateUser,handleGetAllURL)

router.route("/signup").get(redirectIfAuthenticated, handleShowSignupPage)

router.route("/login").get(redirectIfAuthenticated, handleShowLoginPage)

router.route("/forgot-password").get(handleShowForgotPasswordPage);

router.route("/privacy").get(handleShowPrivacyPage);

router.route("/terms").get(handleShowTermsPage);

router.route("/about").get(handleShowAboutPage);

router.route("/account-banned").get(handleShowAccountBannedPage);

router.route("/profile").get(authenticateUser, handleShowProfilePage);

export default router;
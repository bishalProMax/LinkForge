import { Router } from "express";
import { handleGetAllURL } from "../controllers/url.controller.js";
import { handleShowSignupPage, handleShowLoginPage} from "../controllers/static.controller.js";
import authenticateUser from "../middlewares/auth.middleware.js";
import { handleShowForgotPasswordPage } from "../controllers/static.controller.js";

const router = Router()

//SSR
router.route("/linkforge").get(authenticateUser,handleGetAllURL)

router.route("/signup").get(handleShowSignupPage)

router.route("/login").get(handleShowLoginPage)

router.route("/forgot-password").get(handleShowForgotPasswordPage);

export default router;
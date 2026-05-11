import { Router } from "express";
import { handleGetAllURL } from "../controllers/url.controller.js";
import { handleShowSignupPage, handleShowLoginPage} from "../controllers/static.controller.js";
import authenticateUser from "../middleware/auth.middleware.js";


const router = Router()



//SSR
router.route("/linkforge").get(authenticateUser,handleGetAllURL)

router.route("/signup").get(handleShowSignupPage)

router.route("/login").get(handleShowLoginPage)

export default router;
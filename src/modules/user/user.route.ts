import { Router } from "express";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";
import { handleUpdateUsername, handleChangePassword, handleUpdateDetails, handleDeleteAccountStub } from "./user.controller.js";

const router = Router();

router.route("/profile/username").patch(authenticateUser, handleUpdateUsername);
router.route("/profile/password").patch(authenticateUser, handleChangePassword);
router.route("/profile/details").patch(authenticateUser, handleUpdateDetails);
router.route("/profile/delete-account").delete(authenticateUser, handleDeleteAccountStub);

export default router;

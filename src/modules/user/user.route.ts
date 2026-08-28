import { Router } from "express";
import { authenticateUser } from "../../shared/middlewares/auth.middleware.js";
import { validateJSON } from "../../shared/middlewares/validation.middleware.js";
import { usernameSchema, changePasswordSchema, updateDetailsSchema, deleteAccountSchema } from "./user.schemas.js";
import { handleUpdateUsername, handleChangePassword, handleUpdateDetails, handleRequestAccountDeletion } from "./user.controller.js";

const router = Router();

router.route("/profile/username").patch(authenticateUser, validateJSON(usernameSchema), handleUpdateUsername);
router.route("/profile/password").patch(authenticateUser, validateJSON(changePasswordSchema), handleChangePassword);
router.route("/profile/details").patch(authenticateUser, validateJSON(updateDetailsSchema), handleUpdateDetails);
router.route("/profile/delete-account").delete(authenticateUser, validateJSON(deleteAccountSchema), handleRequestAccountDeletion);

export default router;

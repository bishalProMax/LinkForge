import { Router } from "express";
import passport from "passport";
import { createToken } from "../services/auth.service.js";
import  cookieOptions  from "../utils/cookieOptions.js";

const router = Router();

// -----------------------------GOOGLE AUTH-----------------------------
router.get("/google",passport.authenticate("google", {scope: ["profile", "email"]} ));

// -----------------------------GOOGLE CALLBACK-----------------------------
router.get("/google/callback", passport.authenticate("google", {session: false, failureRedirect: "/login" }),

  async (req, res) => {
    const user = req.user as any;

    const token = createToken(user);
    res.cookie("token", token, cookieOptions);
    res.redirect("/linkforge");
  }
);

export default router;

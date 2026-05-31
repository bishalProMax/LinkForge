import type { Request, Response } from "express";

const handleShowSignupPage = (req: Request, res: Response): void => {
  res.render("signup", { error: req.query.error || null, old: {} });
};

const handleShowLoginPage = (req: Request, res: Response): void => {
  const verification = typeof req.query.verification === "string" ? req.query.verification : undefined;

  let message: string | null = null;

  if (verification === "pending") {
    message = "A verification link has been sent to your email address.";
  }

  if (verification === "resent") {
    message = "Verification email resent successfully.";
  }

  res.render("login", {
    error: req.query.error || null,
    old: {},
    verificationMessage: message || null,
  });
};

const handleShowForgotPasswordPage = (req: Request, res: Response): void => {
  res.render("forgot-password", {
    error: null,
    message: null,
  });
};

const handleShowLandingPage = (req: Request, res: Response): void => {
  res.render("landing");
};

const handleShowPrivacyPage = (req: Request, res: Response): void => {
  res.render("privacy");
};

const handleShowTermsPage = (req: Request, res: Response): void => {
  res.render("terms");
};

const handleShowAboutPage = (req: Request, res: Response): void => {
  res.render("about");
};

export { handleShowSignupPage, handleShowLoginPage, handleShowForgotPasswordPage, handleShowLandingPage, handleShowPrivacyPage, handleShowTermsPage, handleShowAboutPage };

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

export { 
  handleShowSignupPage, 
  handleShowLoginPage, 
  handleShowForgotPasswordPage 
};

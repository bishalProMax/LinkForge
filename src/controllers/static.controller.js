const handleShowSignupPage = (req, res) => {
  res.render("signup", { error: req.query.error || null, old: {} })
};

const handleShowLoginPage = (req, res) => {
  let message;
  if (req.query.verification === "pending") {
    message = "A verification link has been sent to your email address."
  }

  if (req.query.verification === "resent") {
    message = "Verification email resent successfully."
  }

  res.render("login", {
    error: req.query.error || null,
    old: {},
    verificationMessage: message || null,
  })
};

module.exports = {
  handleShowSignupPage,
  handleShowLoginPage,
};

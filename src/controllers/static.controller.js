const handleShowSignupPage = (req, res) => {
  res.render("signup", { error: req.query.error || null, old: {} });
};
const handleShowLoginPage = (req, res) => {
  res.render("login", { error: req.query.error || null, old: {} });
};

module.exports = {
  handleShowSignupPage,
  handleShowLoginPage,
};

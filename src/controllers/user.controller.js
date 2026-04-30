const asyncHandler = require("../utils/asyncHandler.js");
const User = require("../models/user.models.js");
const { createToken } = require("../service/auth.service.js");

//SIGNUP
const handleUserSignup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const old = { ...req.body };
  delete old.password;

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    return res.render("signup", {
      error: "Email already exists",
      old,
    });
  }

  try {
    await User.create({ name, email, password });
    return res.redirect("/login");
  } catch (err) {
    console.log(err);
    return res.render("signup", {
      error: "something went wrong while registering the user",
      old,
    });
  }
});

//LOGIN
const handleUserLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const old = { ...req.body };
  delete old.password;

  const user = await User.findOne({ email });

  if (!user) {
    return res.render("login", { error: "email not registered", old });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.render("login", { error: "Invalid password", old });
  }

  const token = createToken(user);
  res.cookie("token", token, {
    httpOnly: true,
  });
  return res.redirect("/linkforge");
});

const handleUserLogout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
  });
  return res.redirect("/login");
};

module.exports = {
  handleUserSignup,
  handleUserLogin,
  handleUserLogout,
};

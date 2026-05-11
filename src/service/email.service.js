const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const transporter = require("../config/email.js");

//verification email after registration
const sendVerificationEmail = async ({ email, name, verificationLink }) => {
  const templatePath = path.join(__dirname, "../templates/verifyEmail.hbs");

  const source = fs.readFileSync(templatePath, "utf-8");

  const template = handlebars.compile(source);

  const html = template({name, verificationLink});

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your LinkForge account",
    html,
  });
};

//welcome email after successful verification
const sendWelcomeEmail = async ({ email, name, loginLink }) => {
  const templatePath = path.join(__dirname, "../templates/welcome.hbs");

  const source = fs.readFileSync(templatePath, "utf-8");

  const template = handlebars.compile(source);

  const html = template({name, loginLink});

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to LinkForge 🚀",
    html,
  });
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail
}

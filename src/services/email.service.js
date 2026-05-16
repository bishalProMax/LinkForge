import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import transporter from "../configs/email.config.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const renderTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname,`../templates/${templateName}.hbs`);
  const source = fs.readFileSync(templatePath,"utf-8");
  const template = handlebars.compile(source);

  return template(data);
};

//verification email after registration
const sendVerificationEmail = async ({ email, name, verificationLink }) => {
  const html = renderTemplate("verifyEmail",{ name, verificationLink });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your LinkForge account",
    html,
  });
};

//welcome email after successful verification
const sendWelcomeEmail = async ({ email, name, loginLink }) => {
  const html = renderTemplate("welcome", { name, loginLink });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to LinkForge 🚀",
    html,
  });
};

export {
  sendVerificationEmail,
  sendWelcomeEmail,
};

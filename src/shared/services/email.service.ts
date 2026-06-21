import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import transporter from "../../infrastructure/configs/email.config.js";
import { fileURLToPath } from "url";
import type { SendVerificationEmailJob, SendWelcomeEmailJob, SendPasswordResetOTPJob, SendPasswordChangedEmailJob } from "../types/queue.types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type TemplateData = {
  [key: string]: string;
};

// Function to render Handlebars templates
const renderTemplate = (templateName: string, data: TemplateData): string => {
  const templatePath = path.join(__dirname, `../../templates/${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, "utf-8");
  const template = handlebars.compile(source);

  return template(data);
};

//verification email after registration
const sendVerificationEmail = async ({ email, name, verificationLink }: SendVerificationEmailJob): Promise<void> => {
  const html = renderTemplate("verifyEmail", { name, verificationLink });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your LinkForge account",
    html,
  });
};

//welcome email after successful verification
const sendWelcomeEmail = async ({ email, name, loginLink }: SendWelcomeEmailJob): Promise<void> => {
  const html = renderTemplate("welcome", { name, loginLink });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to LinkForge 🚀",
    html,
  });
};

//password reset OTP email
const sendPasswordResetOTP = async ({ email, name, otp }: SendPasswordResetOTPJob): Promise<void> => {
  const html = renderTemplate("passwordResetOTP", { name, otp });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset OTP",
    html,
  });
};

//password changed notification email
const sendPasswordChangedEmail = async ({ email, name}: SendPasswordChangedEmailJob): Promise<void> => {
  const html = renderTemplate("passwordChanged", { name });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Changed",
    html,
  });
};

export { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetOTP, sendPasswordChangedEmail };

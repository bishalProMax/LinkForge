import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import transporter from "../../infrastructure/configs/email.config.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type TemplateData = {
  [key: string]: string;
};

// Function to render Handlebars templates
const renderTemplate = (templateName: string, data: TemplateData): string => {
  const templatePath = path.join(__dirname, `../templates/${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, "utf-8");
  const template = handlebars.compile(source);

  return template(data);
};

//verification email after registration
type VerificationEmailProps = {
  email: string;
  name: string;
  verificationLink: string;
};

const sendVerificationEmail = async ({ email, name, verificationLink }: VerificationEmailProps): Promise<void> => {
  const html = renderTemplate("verifyEmail", { name, verificationLink });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your LinkForge account",
    html,
  });
};

//welcome email after successful verification
type WelcomeEmailProps = {
  email: string;
  name: string;
  loginLink: string;
};

const sendWelcomeEmail = async ({ email, name, loginLink }: WelcomeEmailProps): Promise<void> => {
  const html = renderTemplate("welcome", { name, loginLink });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to LinkForge 🚀",
    html,
  });
};

//password reset OTP email
type PasswordResetOTPProps = {
  email: string;
  name: string;
  otp: string;
};

const sendPasswordResetOTP = async ({ email, name, otp }: PasswordResetOTPProps): Promise<void> => {
  const html = renderTemplate("passwordResetOTP", { name, otp });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset OTP",
    html,
  });
};

//password changed notification email
type SendPasswordChangedEmailJob = {
  email: string;
  name: string;
};

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

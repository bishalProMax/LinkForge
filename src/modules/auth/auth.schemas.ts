import { z } from "zod";

// For signup, we need name, email and password with specific validation rules
const signupSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),

  email: z.email("Please enter a valid email address").transform((email) => email.trim().toLowerCase()),

  password: z
    .string()
    .trim()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must be 8+ characters with uppercase, lowercase, number & special character (@$!%*?&)"),

  "cf-turnstile-response": z.string().min(1),  
});

// For login, we only need email and password
const loginSchema = z.object({
  email: z.email("Please enter a valid email address").transform((email) => email.trim().toLowerCase()),

  password: z.string().min(1, "Password is required"),
});

// For sending OTP email
const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address").transform((email) => email.trim().toLowerCase()),
});

// For verifying OTP and allowing password reset
const verifyOtpSchema = z.object({
  email: z.email("Please enter a valid email address").transform((email) => email.trim().toLowerCase()),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// For resetting password after OTP verification
const resetPasswordSchema = z.object({
    email: z.email("Please enter a valid email address").transform((email) => email.trim().toLowerCase()),
    password: z
      .string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must be 8+ characters with uppercase, lowercase, number & special character (@$!%*?&)"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],  //Attach this error to confirmPassword field
  });

  export { 
    signupSchema, 
    loginSchema, 
    forgotPasswordSchema, 
    verifyOtpSchema, 
    resetPasswordSchema 
  };
import { z } from "zod";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const usernameSchema = z.object({
  name: z
  .string()
  .trim()
  .min(3, "Name must be at least 3 characters")
  .max(50, "Name must be under 50 characters"),
});

const changePasswordSchema = z.object({
    oldPassword: z
    .string()
    .trim()
    .optional(),
    newPassword: z
    .string()
    .trim()
      .regex(PASSWORD_REGEX, "Password must be 8+ characters with uppercase, lowercase, number & special character (@$!%*?&)"),
    confirmNewPassword: z
    .string()
    .trim(),
  })
  .superRefine((data,ctx) => {
    if(data.oldPassword === data.newPassword){
      ctx.addIssue({ code: "custom", path: ["oldPassword"], message: "New password cannot be the Old Password." });
    }
    if(data.newPassword !== data.confirmNewPassword){
      ctx.addIssue({ code: "custom", path: ["confirmNewPassword"], message: "Passwords donot match" });
    }
  }
  );

const updateDetailsSchema = z.object({
  organization: z
  .preprocess((v) => (v === "" ? undefined : v), 
  z
  .string()
  .trim()
  .max(100, "Organization must be under 100 characters")
  .optional()),

  designation: z
  .preprocess((v) => (v === "" ? undefined : v), 
  z
  .string()
  .trim()
  .max(100, "Designation must be under 100 characters")
  .optional()),
});

const deleteAccountSchema = z.object({
  confirmText: z
  .literal("CONFIRM DELETE", { message: "You must type CONFIRM DELETE exactly" }),
});

export {
  usernameSchema,
  changePasswordSchema,
  updateDetailsSchema,
  deleteAccountSchema,
};
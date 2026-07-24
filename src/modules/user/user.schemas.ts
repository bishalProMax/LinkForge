import { z } from "zod";

const createInviteSchema = z.object({
  email: z
  .email("Please enter a valid email address")
  .transform((email) => email.trim().toLowerCase()),
  role: z
  .enum(["ADMIN", "SUPER_ADMIN"]),
});

export { createInviteSchema };
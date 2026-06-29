import { z } from "zod";

export const createUrlSchema = z.object({
  url: z.url("Please enter a valid URL"),

  customAlias: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .trim()
      .regex(/^(?=.*[a-zA-Z0-9])[a-zA-Z0-9_-]{3,50}$/, "Alias can only contain letters, numbers, hyphens and underscores.")
      .optional()
  ),
});

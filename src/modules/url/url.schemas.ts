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
  expiration: z.enum([
      "never",
      "1d",
      "7d",
      "30d",
      "90d",
      "custom",
    ]),

    customExpiry: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.date().optional()
    ),
  })
  .superRefine((data, ctx) => {
    if (data.expiration === "custom") {
      if (!data.customExpiry) {
        ctx.addIssue({
          code: "custom",
          path: ["customExpiry"],
          message: "Please select an expiry date.",
        });

        return;
      }

      if (data.customExpiry <= new Date()) {
        ctx.addIssue({
          code: "custom",
          path: ["customExpiry"],
          message: "Expiry date must be in the future.",
        });
      }
    }
});

import { z } from "zod";
import { isValidPublicDomain } from "../../shared/utils/urlValidation.js";

export const createUrlSchema = z
  .object({
    url: z.preprocess(
      (value) => {
        if (typeof value !== "string") return value;
        const trimmed = value.trim();

        if (!trimmed) return trimmed;

        try {
          new URL(trimmed);
          return trimmed; 
        } catch {
          return `https://${trimmed}`; 
        }
      },
      z.url({ message: "Please enter a valid URL." })
      .refine(isValidPublicDomain, {
      message: "Please enter a valid public domain (e.g. example.com).",
    })
    ),

    title: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z
      .string()
      .trim()
      .max(100, "Title must be 100 characters or fewer.")
      .optional()
    ),

    customAlias: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z
        .string()
        .trim()
        .regex(/^(?=.*[a-zA-Z0-9])[a-zA-Z0-9_-]{3,50}$/, "Alias can only contain letters, numbers, hyphens and underscores.")
        .optional()
    ),

    expiration: z.enum(["never", "1d", "7d", "30d", "90d", "custom"]),

    customExpiry: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.date().optional()),

    createQr: z.preprocess(
      (value) => value === "on" || value === "true" || value === true,
      z
      .boolean()
      .optional()
      .default(false)
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

  //edit url schema
  export const editUrlSchema = z.object({
  url: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      if (!trimmed) return trimmed;
      try {
        new URL(trimmed);
        return trimmed;
      } catch {
        return `https://${trimmed}`;
      }
    },
    z.url({ message: "Please enter a valid URL." })
    .refine(isValidPublicDomain, {
      message: "Please enter a valid public domain (e.g. example.com).",
    })),

  alias: z
    .string()
    .trim()
    .regex(/^(?=.*[a-zA-Z0-9])[a-zA-Z0-9_-]{3,50}$/, "Alias can only contain letters, numbers, hyphens and underscores."),

  title: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z
    .string()
    .trim()
    .max(100, "Title must be 100 characters or fewer.")
    .optional()
  ),

  expiration: z.enum(["never", "1d", "7d", "30d", "90d", "custom"]),

  customExpiry: z.preprocess((value) => (value === "" ? undefined : value), 
  z.coerce
  .date()
  .optional()
  ),
}).superRefine((data, ctx) => {
  if (data.expiration === "custom") {
    if (!data.customExpiry) {
      ctx.addIssue({ code: "custom", path: ["customExpiry"], message: "Please select an expiry date." });
      return;
    }
    if (data.customExpiry <= new Date()) {
      ctx.addIssue({ code: "custom", path: ["customExpiry"], message: "Expiry date must be in the future." });
    }
  }
});


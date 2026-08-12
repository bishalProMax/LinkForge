import { z } from "zod";
import { isValidPublicDomain } from "../../shared/utils/urlValidation.js";

export const designSchema = z.object({
  fgColor: z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Invalid color value.")
  .optional(),

  bgColor: z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Invalid color value.")
  .optional(),

  dotStyle: z
  .enum(["square", "rounded", "dots"])
  .optional(),

  frameShape: z
  .enum(["sharp", "round"])
  .optional(),
});

// For standalone QR creation
export const createStandaloneQRSchema = z
  .object({
    destinationURL: z.preprocess(
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
      z.string().trim().max(100, "Title must be 100 characters or fewer.").optional()
    ),

    expiration: z.enum(["never", "1d", "7d", "30d", "90d", "custom"]),

    customExpiry: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.date().optional()),

    design: designSchema.optional(),
  })
  .superRefine((data, ctx) => {
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

// For editing an existing QR's own destination/title (standalone case) or design
export const editQRSchema = z.object({
  title: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(100).optional()
  ),
  destinationURL: z.preprocess(
    (value) => {
      if (typeof value !== "string" || !value.trim()) return undefined;
      const trimmed = value.trim();
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
    .optional()
  ),
  expiration: z.enum(["never", "1d", "7d", "30d", "90d", "custom"]),

  customExpiry: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.date().optional()),

}).superRefine((data, ctx) => {
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
  });;

export const updateDesignSchema = z.object({
  design: designSchema,
});


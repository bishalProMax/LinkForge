import { z } from "zod";

export const createUrlSchema = z.object({
  url: z.url("Please enter a valid URL"),
});
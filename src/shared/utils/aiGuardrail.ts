import type { ZodType } from "zod";

const validateToolInput = <T>(schema: ZodType<T>, input: unknown): { success: true; data: T } | { success: false; error: string } => {
  const result = schema.safeParse(input);

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? "Invalid input" };
  }

  return { success: true, data: result.data };
};

export { validateToolInput };
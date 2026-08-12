import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import type { viewName, redirectPath } from "../types/validation.types.js";


const SENSITIVE_FIELDS = ["password", "confirmPassword"] as const;

interface renderValidationOptions {
  view: viewName;
  extraNullField?: string[];
}

interface redirectValidationOptions {
  redirectPath: redirectPath;
}

const stripSensitiveFields = (data: Record<string, unknown>): Record<string, unknown> => {
  const clean = { ...data };
  for (const field of SENSITIVE_FIELDS) {
    delete clean[field];
  }
  return clean;
};


const validateRender = <T>(schema: ZodType<T>, options: renderValidationOptions) => {

  return (req: Request, res: Response, next: NextFunction): void => {

    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = result.error.issues[0]?.message ?? "Invalid input";
      const old = stripSensitiveFields(req.body as Record<string, unknown>);

      const renderData: Record<string, unknown> = { error, old };

      for (const field of options.extraNullField ?? []) {  //?? fallback to empty array if extraNullField is undefined
      renderData[field] = null;
      }

      res.status(400).render(options.view, renderData);
      return;
    }

    req.body = result.data as never;
    next();
  };
};

const validateRedirect = <T>(schema: ZodType<T>, options: redirectValidationOptions) => {

  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = result.error.issues[0]?.message ?? "Invalid input";
      res.redirect(`${options.redirectPath}?error=${encodeURIComponent(error)}`);
      return;
    }

    req.body = result.data as never;
    next();
  };
};

// when the redirect path is dynamic like shortid or qrid in params which depends on the request 
const validateRedirectDynamic = <T>(schema: ZodType<T>, param: string, base: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = result.error.issues[0]?.message ?? "Invalid input";
      res.redirect(`${base}/${req.params[param]}/edit?error=${encodeURIComponent(error)}`);
      return;
    }

    req.body = result.data as never;
    next();
  };
};

const validateJSON = <T>(schema: ZodType<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid input";
      res.status(400).json({ success: false, message });
      return;
    }

    req.body = result.data as never;
    next();
  };
};

export {
  validateRender, 
  validateRedirect, 
  validateRedirectDynamic,
  validateJSON 
  };
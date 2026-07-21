import type { CookieOptions } from "express";

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

const accessTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  path: "/",
  maxAge: 15 * 60 * 1000, 
};

const refreshTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000, 
};

export { 
  accessTokenCookieOptions, 
  refreshTokenCookieOptions 
  };

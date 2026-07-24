import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import redis from "../../infrastructure/configs/redis.config.js";
import type { UserPayload, TokenPayload, RefreshSessionRecord } from "../types/jwt.types.js";

const REFRESH_TOKEN_TTL_SECONDS = Number((process.env.REFRESH_TOKEN_EXPIRES) || 30) * 24 * 60 * 60; 

function createToken(user: UserPayload): string {
  const payload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role
  };
  const expiresIn = (process.env.ACCESS_TOKEN_EXPIRES || "15m") as jwt.SignOptions["expiresIn"];

  return jwt.sign(payload, 
    process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn,
  });
}

function verifyToken(accessToken: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as TokenPayload;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };
  } catch  {
    return null;
  }
}


// -----------------------------REFRESH TOKEN-----------------------------

const hashRefreshSecret = (secret: string): string => {
  return crypto.createHmac("sha256", process.env.REFRESH_TOKEN_SECRET as string).update(secret).digest("hex");
};

const buildRefreshCookieValue = (sessionId: string, secret: string): string => `${sessionId}.${secret}`;

const parseRefreshCookieValue = (cookieValue: string): { sessionId: string; secret: string } | null => {
  const [sessionId, secret] = cookieValue.split(".");
  if (!sessionId || !secret) return null;
  return { sessionId, secret };
};

async function createRefreshSession(user: UserPayload): Promise<string> {
  const sessionId = crypto.randomBytes(16).toString("hex");
  const secret = crypto.randomBytes(32).toString("hex");

  const record: RefreshSessionRecord = {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    secretHash: hashRefreshSecret(secret),
  };

  await redis.set(`refresh-session:${sessionId}`, JSON.stringify(record), "EX", REFRESH_TOKEN_TTL_SECONDS);

  return buildRefreshCookieValue(sessionId, secret);
}

async function rotateRefreshSession(cookieValue: string): Promise<{ user: UserPayload; cookieValue: string } | null> {
  const parsed = parseRefreshCookieValue(cookieValue);
  if (!parsed) return null;

  const { sessionId, secret } = parsed;
  const raw = await redis.get(`refresh-session:${sessionId}`);
  if (!raw) return null; 

  const record = JSON.parse(raw) as RefreshSessionRecord;

  if (record.secretHash !== hashRefreshSecret(secret)) {

    await redis.del(`refresh-session:${sessionId}`);
    return null;
  }


  await redis.del(`refresh-session:${sessionId}`);

  const user: UserPayload = {
    _id: new mongoose.Types.ObjectId(record.userId),
    email: record.email,
    name: record.name,
    role: record.role
  };

  const newCookieValue = await createRefreshSession(user);

  return { user, cookieValue: newCookieValue };
}

async function revokeRefreshSession(cookieValue: string): Promise<void> {
  const parsed = parseRefreshCookieValue(cookieValue);
  if (!parsed) return;

  await redis.del(`refresh-session:${parsed.sessionId}`);
}

export {
  createToken,
  verifyToken,
  createRefreshSession,
  rotateRefreshSession,
  revokeRefreshSession,
};


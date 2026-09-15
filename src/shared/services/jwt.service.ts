import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import redis from "../../infrastructure/configs/redis.config.js";
import { logSecurityEvent } from "./securityLogger.service.js";
import type { UserPayload, TokenPayload, RefreshSessionRecord } from "../types/jwt.types.js";

const REFRESH_TOKEN_TTL_SECONDS = Number((process.env.REFRESH_TOKEN_EXPIRES) || 30) * 24 * 60 * 60; 
const GRACE_TTL_SECONDS = 10;

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

const userSessionsKey = (userId: string): string => `user-sessions:${userId}`;
const graceKey = (sessionId: string): string => `refresh-session-grace:${sessionId}`;

const recordToUserPayload = (record: RefreshSessionRecord): UserPayload => ({
  _id: new mongoose.Types.ObjectId(record.userId),
  email: record.email,
  name: record.name,
  role: record.role,
});

//CREATE REFRESH TOKEN
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

  const sessionsKey = userSessionsKey(record.userId);
  await redis.sadd(sessionsKey, sessionId);
  await redis.expire(sessionsKey, REFRESH_TOKEN_TTL_SECONDS);

  return buildRefreshCookieValue(sessionId, secret);
}

async function resolveGracedSession(sessionId: string): Promise<{ user: UserPayload; cookieValue: string } | null> {
  let gracedCookieValue = await redis.get(graceKey(sessionId));

  if (!gracedCookieValue) {
    
    await new Promise((resolve) => setTimeout(resolve, 75));
    gracedCookieValue = await redis.get(graceKey(sessionId));
  }

  if (!gracedCookieValue) return null;

  const gracedParsed = parseRefreshCookieValue(gracedCookieValue);
  if (!gracedParsed) return null;

  const newRaw = await redis.get(`refresh-session:${gracedParsed.sessionId}`);
  if (!newRaw) return null;

  const newRecord = JSON.parse(newRaw) as RefreshSessionRecord;

  logSecurityEvent(
    { event: "SESSION_ROTATION_GRACE_USED", userId: newRecord.userId, email: newRecord.email, role: newRecord.role },
    "info"
  );

  return { user: recordToUserPayload(newRecord), cookieValue: gracedCookieValue };
}

//ROTATE REFRESH TOKEN
async function rotateRefreshSession(cookieValue: string): Promise<{ user: UserPayload; cookieValue: string } | null> {
  const parsed = parseRefreshCookieValue(cookieValue);
  if (!parsed) return null;

  const { sessionId, secret } = parsed;

  const raw = await redis.getdel(`refresh-session:${sessionId}`);

  if (!raw) {
    return resolveGracedSession(sessionId);
  }

  const record = JSON.parse(raw) as RefreshSessionRecord;

  if (record.secretHash !== hashRefreshSecret(secret)) {
    await redis.srem(userSessionsKey(record.userId), sessionId);
    await revokeAllUserSessions(record.userId);
    return null;
  }

  const user = recordToUserPayload(record);

  const newSessionId = crypto.randomBytes(16).toString("hex");
  const newSecret = crypto.randomBytes(32).toString("hex");
  const newCookieValue = buildRefreshCookieValue(newSessionId, newSecret);

  const newRecord: RefreshSessionRecord = {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    secretHash: hashRefreshSecret(newSecret),
  };

  const sessionsKey = userSessionsKey(record.userId);

  await redis
    .multi()
    .srem(sessionsKey, sessionId)
    .set(`refresh-session:${newSessionId}`, JSON.stringify(newRecord), "EX", REFRESH_TOKEN_TTL_SECONDS)
    .sadd(sessionsKey, newSessionId)
    .expire(sessionsKey, REFRESH_TOKEN_TTL_SECONDS)
    .set(graceKey(sessionId), newCookieValue, "EX", GRACE_TTL_SECONDS)
    .exec();

  return { user, cookieValue: newCookieValue };
}

//REVOKE REFRESH TOKEN
async function revokeRefreshSession(cookieValue: string): Promise<void> {
  const parsed = parseRefreshCookieValue(cookieValue);
  if (!parsed) return;

  const raw = await redis.get(`refresh-session:${parsed.sessionId}`);

  await redis.del(`refresh-session:${parsed.sessionId}`);

  if (raw) {
    const record = JSON.parse(raw) as RefreshSessionRecord;
    await redis.srem(userSessionsKey(record.userId), parsed.sessionId);
  }
}

async function revokeAllUserSessions(userId: string): Promise<void> {
  const sessionsKey = userSessionsKey(userId);
  const sessionIds = await redis.smembers(sessionsKey);

  if (sessionIds.length > 0) {
    const sessionKeys = sessionIds.map((id) => `refresh-session:${id}`);
    await redis.del(...sessionKeys);
  }

  await redis.del(sessionsKey);
}

export {
  createToken,
  verifyToken,
  createRefreshSession,
  rotateRefreshSession,
  revokeRefreshSession,
  revokeAllUserSessions,
};
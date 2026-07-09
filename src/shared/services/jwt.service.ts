import jwt from "jsonwebtoken";
import type { UserPayload, TokenPayload } from "../types/jwt.types.js";

function createToken(user: UserPayload): string {
  const payload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    name: user.name
  };
  const expiresIn = (process.env.JWT_EXPIRES || "1d") as jwt.SignOptions["expiresIn"];

  return jwt.sign(payload, 
    process.env.JWT_SECRET as string, {
    expiresIn,
  });
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };
  } catch  {
    return null;
  }
}

export { 
    createToken, 
    verifyToken 
};

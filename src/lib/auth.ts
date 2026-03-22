import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;
export const TOKEN_COOKIE = "ns_token";

const RESERVED = new Set([
  "admin", "api", "www", "app", "auth", "login", "logout",
  "signup", "editor", "support", "help", "static", "assets",
]);

export interface TokenPayload {
  userId: string;
  username: string;
}

export function isValidUsername(u: string) {
  if (u.length < 3 || u.length > 30) return false;
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(u)) return false;
  if (RESERVED.has(u)) return false;
  return true;
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/** 서버 컴포넌트용 */
export async function getSession(): Promise<TokenPayload | null> {
  const token = cookies().get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** API Route용 */
export function getSessionFromRequest(req: Request): TokenPayload | null {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${TOKEN_COOKIE}=([^;]+)`));
  if (match) return verifyToken(match[1]);
  const auth = req.headers.get("authorization") ?? "";
  if (auth.startsWith("Bearer ")) return verifyToken(auth.slice(7));
  return null;
}

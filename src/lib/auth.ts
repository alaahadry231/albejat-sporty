import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET || "fallback-secret-change-me"
);

export const SESSION_COOKIE = "admin_session";

export async function createSession(username: string) {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  return token;
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { username: string };
  } catch {
    return null;
  }
}

export function checkCredentials(username: string, password: string) {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  return username === adminUser && password === adminPass;
}
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "./auth";

export async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const session = await verifySession(token);
  return session !== null;
}
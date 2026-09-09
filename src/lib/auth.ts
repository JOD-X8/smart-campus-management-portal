import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export interface SessionUser {
  id: string;
  email: string;
  role: "ADMIN" | "FACULTY" | "STUDENT";
  name: string;
  studentId?: string;
  facultyId?: string;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "smart-campus-management-super-secret-key-prod-2024"
);

export const AUTH_COOKIE_NAME = "smart_campus_session";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signJWT(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value ||
    req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyJWT(token);
}

export async function getCurrentSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJWT(token);
  } catch {
    return null;
  }
}

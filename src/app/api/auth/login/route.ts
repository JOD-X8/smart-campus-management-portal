import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, signJWT, AUTH_COOKIE_NAME } from "@/lib/auth";
import { loginSchema } from "@/schemas/auth";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation error", 400);
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        studentProfile: true,
        facultyProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return apiError("Invalid email or password", 401);
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return apiError("Invalid email or password", 401);
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
      studentId: user.studentProfile?.id,
      facultyId: user.facultyProfile?.id,
      avatarUrl: user.avatarUrl,
    };

    const token = await signJWT(sessionPayload);

    const response = apiSuccess(sessionPayload, "Login successful");

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return apiError("An internal error occurred during login", 500);
  }
}

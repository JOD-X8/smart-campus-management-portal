import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { apiError, apiSuccess, apiUnauthorized } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return apiUnauthorized("No active session");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        studentProfile: {
          include: { department: true },
        },
        facultyProfile: {
          include: { department: true },
        },
      },
    });

    if (!user || !user.isActive) {
      return apiUnauthorized("User not found or account is deactivated");
    }

    return apiSuccess({
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      studentProfile: user.studentProfile,
      facultyProfile: user.facultyProfile,
    });
  } catch (error) {
    console.error("Auth Me error:", error);
    return apiError("Internal server error", 500);
  }
}

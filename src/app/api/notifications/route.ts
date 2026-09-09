import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY", "STUDENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: auth.user!.id },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    return apiSuccess(notifications);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return apiError("Failed to fetch notifications", 500);
  }
}

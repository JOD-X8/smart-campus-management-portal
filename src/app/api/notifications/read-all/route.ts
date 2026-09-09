import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function PATCH(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY", "STUDENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    await prisma.notification.updateMany({
      where: { userId: auth.user!.id, isRead: false },
      data: { isRead: true },
    });

    return apiSuccess(null, "All notifications marked as read");
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return apiError("Failed to update notifications", 500);
  }
}

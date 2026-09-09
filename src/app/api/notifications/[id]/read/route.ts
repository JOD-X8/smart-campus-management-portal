import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY", "STUDENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const updated = await prisma.notification.update({
      where: { id: params.id, userId: auth.user!.id },
      data: { isRead: true },
    });

    return apiSuccess(updated, "Notification marked as read");
  } catch (error) {
    console.error("Mark notification read error:", error);
    return apiError("Failed to update notification", 500);
  }
}

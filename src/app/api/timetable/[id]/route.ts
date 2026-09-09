import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY"]);
  if (!auth.authorized) return auth.response!;

  try {
    await prisma.timetableSlot.delete({
      where: { id: params.id },
    });

    return apiSuccess(null, "Timetable slot deleted successfully");
  } catch (error) {
    console.error("Delete timetable slot error:", error);
    return apiError("Failed to delete timetable slot", 500);
  }
}

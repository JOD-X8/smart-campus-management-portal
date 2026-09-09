import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { departmentSchema } from "@/schemas/department";
import { apiSuccess, apiError, apiNotFound } from "@/lib/api-response";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const result = departmentSchema.partial().safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const data = result.data;

    const updated = await prisma.department.update({
      where: { id: params.id },
      data: {
        code: data.code?.toUpperCase(),
        name: data.name,
        description: data.description,
        hodName: data.hodName,
      },
      include: {
        _count: {
          select: { students: true, faculty: true, courses: true },
        },
      },
    });

    return apiSuccess(updated, "Department updated successfully");
  } catch (error) {
    console.error("Update department error:", error);
    return apiError("Failed to update department", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    await prisma.department.delete({
      where: { id: params.id },
    });

    return apiSuccess(null, "Department deleted successfully");
  } catch (error) {
    console.error("Delete department error:", error);
    return apiError("Failed to delete department", 500);
  }
}

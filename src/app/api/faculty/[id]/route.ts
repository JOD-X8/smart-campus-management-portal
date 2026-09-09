import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { facultySchema } from "@/schemas/faculty";
import { apiSuccess, apiError, apiNotFound } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY", "STUDENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        department: true,
        courses: true,
        timetableSlots: {
          include: { course: true },
        },
      },
    });

    if (!faculty) return apiNotFound("Faculty member not found");

    return apiSuccess(faculty);
  } catch (error) {
    console.error("Get faculty by ID error:", error);
    return apiError("Failed to fetch faculty member", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const result = facultySchema.partial().safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const data = result.data;
    const existing = await prisma.faculty.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!existing) return apiNotFound("Faculty member not found");

    const updated = await prisma.$transaction(async (tx) => {
      if (data.firstName || data.lastName || data.email) {
        await tx.user.update({
          where: { id: existing.userId },
          data: {
            firstName: data.firstName ?? existing.user.firstName,
            lastName: data.lastName ?? existing.user.lastName,
            email: data.email ? data.email.toLowerCase() : existing.user.email,
          },
        });
      }

      return tx.faculty.update({
        where: { id: params.id },
        data: {
          departmentId: data.departmentId ?? existing.departmentId,
          designation: data.designation ?? existing.designation,
          qualification: data.qualification ?? existing.qualification,
          phone: data.phone ?? existing.phone,
          status: data.status ?? existing.status,
        },
        include: {
          user: true,
          department: true,
        },
      });
    });

    return apiSuccess(updated, "Faculty member updated successfully");
  } catch (error) {
    console.error("Update faculty error:", error);
    return apiError("Failed to update faculty member", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: params.id },
    });

    if (!faculty) return apiNotFound("Faculty member not found");

    await prisma.user.delete({
      where: { id: faculty.userId },
    });

    return apiSuccess(null, "Faculty member deleted successfully");
  } catch (error) {
    console.error("Delete faculty error:", error);
    return apiError("Failed to delete faculty member", 500);
  }
}

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { studentSchema } from "@/schemas/student";
import { apiSuccess, apiError, apiNotFound } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY", "STUDENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        department: true,
        enrollments: {
          include: { course: true },
        },
        attendanceRecords: {
          include: { session: { include: { course: true } } },
          orderBy: { session: { date: "desc" } },
          take: 20,
        },
        grades: {
          include: { assessment: { include: { course: true } } },
        },
      },
    });

    if (!student) return apiNotFound("Student not found");

    return apiSuccess(student);
  } catch (error) {
    console.error("Get student by ID error:", error);
    return apiError("Failed to fetch student details", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const result = studentSchema.partial().safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const data = result.data;

    const existing = await prisma.student.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!existing) return apiNotFound("Student not found");

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

      return tx.student.update({
        where: { id: params.id },
        data: {
          departmentId: data.departmentId ?? existing.departmentId,
          program: data.program ?? existing.program,
          year: data.year ?? existing.year,
          semester: data.semester ?? existing.semester,
          section: data.section ?? existing.section,
          admissionYear: data.admissionYear ?? existing.admissionYear,
          status: data.status ?? existing.status,
          phone: data.phone ?? existing.phone,
          gender: data.gender ?? existing.gender,
        },
        include: {
          user: true,
          department: true,
        },
      });
    });

    return apiSuccess(updated, "Student updated successfully");
  } catch (error) {
    console.error("Update student error:", error);
    return apiError("Failed to update student", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!student) return apiNotFound("Student not found");

    await prisma.user.delete({
      where: { id: student.userId },
    });

    return apiSuccess(null, "Student record deleted successfully");
  } catch (error) {
    console.error("Delete student error:", error);
    return apiError("Failed to delete student", 500);
  }
}

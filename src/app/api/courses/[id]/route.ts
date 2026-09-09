import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { courseSchema } from "@/schemas/course";
import { apiSuccess, apiError, apiNotFound } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY", "STUDENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        faculty: { include: { user: true } },
        enrollments: {
          include: {
            student: {
              include: { user: true },
            },
          },
        },
        assessments: true,
        timetableSlots: true,
      },
    });

    if (!course) return apiNotFound("Course not found");

    return apiSuccess(course);
  } catch (error) {
    console.error("Get course by ID error:", error);
    return apiError("Failed to fetch course details", 500);
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
    const result = courseSchema.partial().safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const data = result.data;

    const updated = await prisma.course.update({
      where: { id: params.id },
      data: {
        code: data.code?.toUpperCase(),
        name: data.name,
        description: data.description,
        credits: data.credits,
        departmentId: data.departmentId,
        semester: data.semester,
        academicYear: data.academicYear,
        facultyId: data.facultyId !== undefined ? (data.facultyId || null) : undefined,
      },
      include: {
        department: true,
        faculty: { include: { user: true } },
      },
    });

    return apiSuccess(updated, "Course updated successfully");
  } catch (error) {
    console.error("Update course error:", error);
    return apiError("Failed to update course", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    await prisma.course.delete({
      where: { id: params.id },
    });

    return apiSuccess(null, "Course deleted successfully");
  } catch (error) {
    console.error("Delete course error:", error);
    return apiError("Failed to delete course", 500);
  }
}

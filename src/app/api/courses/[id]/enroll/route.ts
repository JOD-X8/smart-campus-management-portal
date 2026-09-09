import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const { studentIds } = body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return apiError("studentIds must be a non-empty array", 400);
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
    });

    if (!course) return apiError("Course not found", 404);

    let enrolledCount = 0;
    for (const sId of studentIds) {
      try {
        await prisma.enrollment.upsert({
          where: {
            studentId_courseId: {
              studentId: sId,
              courseId: course.id,
            },
          },
          update: {
            status: "ENROLLED",
          },
          create: {
            studentId: sId,
            courseId: course.id,
            semester: course.semester,
            academicYear: course.academicYear,
            status: "ENROLLED",
          },
        });
        enrolledCount++;
      } catch (err) {
        console.error("Enrollment error for student:", sId, err);
      }
    }

    return apiSuccess({ enrolledCount }, `Successfully enrolled ${enrolledCount} students into ${course.code}`);
  } catch (error) {
    console.error("Enroll students error:", error);
    return apiError("Failed to enroll students", 500);
  }
}

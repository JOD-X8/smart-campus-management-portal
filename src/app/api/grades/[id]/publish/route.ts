import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { apiSuccess, apiError } from "@/lib/api-response";
import { NotificationType } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const { isPublished } = body;

    const assessment = await prisma.assessment.update({
      where: { id: params.id },
      data: { isPublished: Boolean(isPublished) },
      include: {
        course: true,
        grades: { include: { student: { include: { user: true } } } },
      },
    });

    // If publishing, notify all graded students
    if (isPublished && assessment.grades.length > 0) {
      for (const grade of assessment.grades) {
        await prisma.notification.create({
          data: {
            userId: grade.student.userId,
            title: `Grades Published: ${assessment.title}`,
            message: `Marks for ${assessment.course.code} - ${assessment.title} have been published. You scored ${grade.marksObtained}/${assessment.maxMarks}.`,
            type: NotificationType.SUCCESS,
            link: "/grades",
          },
        });
      }
    }

    return apiSuccess(assessment, isPublished ? "Grades published to students" : "Grades un-published");
  } catch (error) {
    console.error("Publish assessment error:", error);
    return apiError("Failed to update assessment publish state", 500);
  }
}

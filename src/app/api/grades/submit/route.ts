import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { submitGradesSchema } from "@/schemas/grade";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const result = submitGradesSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const { assessmentId, grades } = result.data;

    await prisma.$transaction(async (tx) => {
      for (const g of grades) {
        await tx.grade.upsert({
          where: {
            assessmentId_studentId: {
              assessmentId,
              studentId: g.studentId,
            },
          },
          update: {
            marksObtained: g.marksObtained,
            feedback: g.feedback,
            gradedAt: new Date(),
          },
          create: {
            assessmentId,
            studentId: g.studentId,
            marksObtained: g.marksObtained,
            feedback: g.feedback,
          },
        });
      }
    });

    return apiSuccess(null, `Recorded grades for ${grades.length} students successfully`);
  } catch (error) {
    console.error("Submit grades error:", error);
    return apiError("Failed to save student marks", 500);
  }
}

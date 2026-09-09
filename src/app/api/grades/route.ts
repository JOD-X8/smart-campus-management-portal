import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { createAssessmentSchema } from "@/schemas/grade";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY", "STUDENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const studentId = searchParams.get("studentId");

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (auth.user!.role === "STUDENT") {
      where.isPublished = true;
    }

    const assessments = await prisma.assessment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        course: true,
        faculty: { include: { user: true } },
        grades: {
          where: studentId ? { studentId } : {},
          include: {
            student: { include: { user: true } },
          },
        },
      },
    });

    return apiSuccess(assessments);
  } catch (error) {
    console.error("Fetch assessments error:", error);
    return apiError("Failed to fetch assessments", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const result = createAssessmentSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const data = result.data;

    const newAssessment = await prisma.assessment.create({
      data: {
        courseId: data.courseId,
        facultyId: data.facultyId,
        title: data.title,
        type: data.type,
        maxMarks: data.maxMarks,
        weightage: data.weightage,
        date: data.date ? new Date(data.date) : null,
        isPublished: false,
      },
      include: {
        course: true,
      },
    });

    return apiSuccess(newAssessment, "Assessment created successfully", 201);
  } catch (error) {
    console.error("Create assessment error:", error);
    return apiError("Failed to create assessment", 500);
  }
}

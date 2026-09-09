import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { assignmentSchema } from "@/schemas/assignment";
import { apiSuccess, apiError } from "@/lib/api-response";
import { NotificationType } from "@prisma/client";

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
      const student = await prisma.student.findUnique({
        where: { userId: auth.user!.id },
        include: { enrollments: true },
      });
      if (student) {
        const enrolledCourseIds = student.enrollments.map((e) => e.courseId);
        where.courseId = { in: enrolledCourseIds };
      }
    }

    const assignments = await prisma.assignment.findMany({
      where,
      orderBy: { dueDate: "asc" },
      include: {
        course: true,
        faculty: { include: { user: true } },
        _count: {
          select: { submissions: true },
        },
        submissions: {
          where: studentId ? { studentId } : auth.user!.studentId ? { studentId: auth.user!.studentId } : {},
          include: {
            student: { include: { user: true } },
          },
        },
      },
    });

    return apiSuccess(assignments);
  } catch (error) {
    console.error("Fetch assignments error:", error);
    return apiError("Failed to fetch assignments", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const result = assignmentSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const data = result.data;

    const newAssignment = await prisma.assignment.create({
      data: {
        courseId: data.courseId,
        facultyId: data.facultyId,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        maxMarks: data.maxMarks,
        attachmentUrl: data.attachmentUrl,
      },
      include: {
        course: true,
      },
    });

    // Notify enrolled students of the new assignment
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: data.courseId },
      include: { student: true },
    });

    for (const enr of enrollments) {
      await prisma.notification.create({
        data: {
          userId: enr.student.userId,
          title: `New Assignment: ${data.title}`,
          message: `A new assignment was posted in ${newAssignment.course.code}. Due on ${new Date(data.dueDate).toLocaleDateString()}.`,
          type: NotificationType.INFO,
          link: "/assignments",
        },
      });
    }

    return apiSuccess(newAssignment, "Assignment published successfully", 201);
  } catch (error) {
    console.error("Create assignment error:", error);
    return apiError("Failed to create assignment", 500);
  }
}

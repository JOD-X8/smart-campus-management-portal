import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["STUDENT", "FACULTY", "ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const requestedStudentId = searchParams.get("studentId");

    let student;
    if (auth.user!.role === "STUDENT") {
      student = await prisma.student.findUnique({
        where: { userId: auth.user!.id },
        include: { enrollments: { include: { course: true } } },
      });
    } else if (requestedStudentId) {
      student = await prisma.student.findUnique({
        where: { id: requestedStudentId },
        include: { enrollments: { include: { course: true } } },
      });
    } else {
      student = await prisma.student.findFirst({
        include: { enrollments: { include: { course: true } } },
      });
    }

    if (!student) {
      return apiError("Student record not found", 404);
    }

    const insights = [];

    // 1. Attendance Analysis
    for (const enr of student.enrollments) {
      const total = await prisma.attendanceSession.count({ where: { courseId: enr.courseId } });
      const present = await prisma.attendanceRecord.count({
        where: { studentId: student.id, status: "PRESENT", session: { courseId: enr.courseId } },
      });
      const pct = total > 0 ? Math.round((present / total) * 100) : 100;

      if (pct < 75) {
        insights.push({
          id: `att-risk-${enr.courseId}`,
          type: "danger",
          category: "Attendance Risk",
          title: `Low Attendance Alert in ${enr.course.code}`,
          description: `Your attendance in ${enr.course.name} is ${pct}%, which is below the university threshold (75%). Attending the next upcoming classes will help restore good standing.`,
          actionLabel: "View Attendance Breakdown",
          actionUrl: "/attendance",
        });
      } else if (pct >= 90) {
        insights.push({
          id: `att-high-${enr.courseId}`,
          type: "success",
          category: "Exemplary Attendance",
          title: `Great Consistency in ${enr.course.code}`,
          description: `You have maintained an outstanding ${pct}% attendance rate in ${enr.course.name}.`,
        });
      }
    }

    // 2. Grade trends
    const grades = await prisma.grade.findMany({
      where: { studentId: student.id, assessment: { isPublished: true } },
      include: { assessment: { include: { course: true } } },
      orderBy: { gradedAt: "desc" },
      take: 5,
    });

    grades.forEach((g) => {
      const pct = (g.marksObtained / g.assessment.maxMarks) * 100;
      if (pct >= 85) {
        insights.push({
          id: `grade-high-${g.id}`,
          type: "success",
          category: "Strong Performance",
          title: `High Achievement in ${g.assessment.course.code}`,
          description: `Scored ${g.marksObtained}/${g.assessment.maxMarks} (${Math.round(pct)}%) on ${g.assessment.title}.`,
          actionLabel: "View Report Card",
          actionUrl: "/grades",
        });
      } else if (pct < 60) {
        insights.push({
          id: `grade-low-${g.id}`,
          type: "warning",
          category: "Performance Review",
          title: `Score below target in ${g.assessment.course.code}`,
          description: `Scored ${g.marksObtained}/${g.assessment.maxMarks} on ${g.assessment.title}. Reviewing feedback and practicing mock problems is recommended.`,
          actionLabel: "View Feedback",
          actionUrl: "/grades",
        });
      }
    });

    // 3. Upcoming deadline prompt
    const nextAssignment = await prisma.assignment.findFirst({
      where: {
        courseId: { in: student.enrollments.map((e) => e.courseId) },
        dueDate: { gte: new Date() },
      },
      orderBy: { dueDate: "asc" },
      include: { course: true },
    });

    if (nextAssignment) {
      const daysLeft = Math.ceil((new Date(nextAssignment.dueDate).getTime() - Date.now()) / (1000 * 3600 * 24));
      insights.push({
        id: `assign-due-${nextAssignment.id}`,
        type: "info",
        category: "Upcoming Deadline",
        title: `Assignment due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
        description: `${nextAssignment.title} for ${nextAssignment.course.code} is due on ${new Date(
          nextAssignment.dueDate
        ).toLocaleDateString()}.`,
        actionLabel: "Go to Assignments",
        actionUrl: "/assignments",
      });
    }

    return apiSuccess(insights);
  } catch (error) {
    console.error("AI Insights API error:", error);
    return apiError("Failed to generate AI performance insights", 500);
  }
}

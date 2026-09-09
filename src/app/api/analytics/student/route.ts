import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { apiSuccess, apiError } from "@/lib/api-response";
import { DayOfWeek } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["STUDENT", "FACULTY", "ADMIN"]);
  if (!auth.authorized) return auth.response!;

  const { searchParams } = new URL(req.url);
  const targetStudentId = searchParams.get("studentId");

  try {
    let student;
    if (auth.user!.role === "STUDENT") {
      student = await prisma.student.findUnique({
        where: { userId: auth.user!.id },
        include: {
          user: true,
          department: true,
        },
      });
    } else if (targetStudentId) {
      student = await prisma.student.findUnique({
        where: { id: targetStudentId },
        include: {
          user: true,
          department: true,
        },
      });
    } else {
      student = await prisma.student.findFirst({
        include: {
          user: true,
          department: true,
        },
      });
    }

    if (!student) {
      return apiError("Student record not found", 404);
    }

    // Attendance breakdown per course
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: student.id, status: "ENROLLED" },
      include: {
        course: true,
      },
    });

    const courseAttendance = await Promise.all(
      enrollments.map(async (enr) => {
        const totalSessions = await prisma.attendanceSession.count({
          where: { courseId: enr.courseId },
        });

        const presentSessions = await prisma.attendanceRecord.count({
          where: {
            studentId: student.id,
            status: "PRESENT",
            session: { courseId: enr.courseId },
          },
        });

        const percentage =
          totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 1000) / 10 : 100;

        return {
          courseId: enr.course.id,
          courseCode: enr.course.code,
          courseName: enr.course.name,
          credits: enr.course.credits,
          totalClasses: totalSessions,
          attendedClasses: presentSessions,
          percentage,
          isWarning: percentage < 75,
        };
      })
    );

    // Overall attendance
    const totalClassesAll = courseAttendance.reduce((sum, c) => sum + c.totalClasses, 0);
    const attendedClassesAll = courseAttendance.reduce((sum, c) => sum + c.attendedClasses, 0);
    const overallAttendance =
      totalClassesAll > 0 ? Math.round((attendedClassesAll / totalClassesAll) * 1000) / 10 : 100;

    // Today's classes
    const daysMap: Record<number, DayOfWeek> = {
      1: "MONDAY",
      2: "TUESDAY",
      3: "WEDNESDAY",
      4: "THURSDAY",
      5: "FRIDAY",
      6: "SATURDAY",
    };
    const currentDay = daysMap[new Date().getDay()] || "MONDAY";

    const enrolledCourseIds = enrollments.map((e) => e.courseId);
    const todaySchedule = await prisma.timetableSlot.findMany({
      where: {
        courseId: { in: enrolledCourseIds },
        dayOfWeek: currentDay,
      },
      include: {
        course: true,
        faculty: { include: { user: true } },
      },
      orderBy: { startTime: "asc" },
    });

    // Upcoming assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: { in: enrolledCourseIds },
        dueDate: { gte: new Date() },
      },
      include: {
        course: true,
        submissions: {
          where: { studentId: student.id },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    });

    // Recent published grades
    const grades = await prisma.grade.findMany({
      where: {
        studentId: student.id,
        assessment: { isPublished: true },
      },
      include: {
        assessment: {
          include: { course: true },
        },
      },
      orderBy: { gradedAt: "desc" },
      take: 6,
    });

    return apiSuccess({
      student,
      overallAttendance,
      courseAttendance,
      todaySchedule,
      upcomingAssignments: assignments,
      recentGrades: grades,
    });
  } catch (error) {
    console.error("Student analytics error:", error);
    return apiError("Failed to fetch student academic metrics", 500);
  }
}

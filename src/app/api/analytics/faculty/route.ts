import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { apiSuccess, apiError } from "@/lib/api-response";
import { DayOfWeek } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["FACULTY", "ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    const faculty = await prisma.faculty.findFirst({
      where: auth.user!.role === "ADMIN" ? {} : { userId: auth.user!.id },
      include: {
        courses: true,
      },
    });

    if (!faculty) {
      return apiSuccess({
        assignedCourses: 0,
        totalStudents: 0,
        todayClasses: [],
        attendanceSummary: 0,
        pendingAssignments: 0,
        courses: [],
      });
    }

    const courseIds = faculty.courses.map((c) => c.id);

    // Total students enrolled
    const totalStudentsEnrolled = await prisma.enrollment.count({
      where: { courseId: { in: courseIds } },
    });

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

    const todayClasses = await prisma.timetableSlot.findMany({
      where: {
        facultyId: faculty.id,
        dayOfWeek: currentDay,
      },
      include: {
        course: true,
      },
      orderBy: { startTime: "asc" },
    });

    // Attendance rate across faculty courses
    const sessions = await prisma.attendanceSession.findMany({
      where: { facultyId: faculty.id },
      include: {
        records: true,
      },
      take: 20,
      orderBy: { date: "desc" },
    });

    let totalRec = 0;
    let presRec = 0;
    sessions.forEach((s) => {
      s.records.forEach((r) => {
        totalRec++;
        if (r.status === "PRESENT") presRec++;
      });
    });

    const attendanceRate = totalRec > 0 ? Math.round((presRec / totalRec) * 1000) / 10 : 100;

    // Pending assignments to grade
    const pendingSubmissions = await prisma.assignmentSubmission.count({
      where: {
        assignment: { facultyId: faculty.id },
        status: "SUBMITTED",
      },
    });

    return apiSuccess({
      facultyProfile: faculty,
      assignedCourses: faculty.courses.length,
      totalStudents: totalStudentsEnrolled,
      todayClasses,
      attendanceRate,
      pendingSubmissions,
      courses: faculty.courses,
    });
  } catch (error) {
    console.error("Faculty analytics error:", error);
    return apiError("Failed to fetch faculty analytics", 500);
  }
}

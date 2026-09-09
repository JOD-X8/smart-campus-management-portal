import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    const [totalStudents, totalFaculty, totalCourses, totalDepartments] = await Promise.all([
      prisma.student.count(),
      prisma.faculty.count(),
      prisma.course.count(),
      prisma.department.count(),
    ]);

    // Average attendance calculation
    const totalAttendanceRecords = await prisma.attendanceRecord.count();
    const presentRecords = await prisma.attendanceRecord.count({
      where: { status: "PRESENT" },
    });
    const avgAttendance =
      totalAttendanceRecords > 0 ? Math.round((presentRecords / totalAttendanceRecords) * 1000) / 10 : 100;

    // Student distribution by department
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { students: true, faculty: true, courses: true },
        },
      },
    });

    const departmentDistribution = departments.map((d) => ({
      name: d.code,
      fullName: d.name,
      students: d._count.students,
      faculty: d._count.faculty,
      courses: d._count.courses,
    }));

    // Course enrollment metrics
    const courses = await prisma.course.findMany({
      take: 6,
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    const courseEnrollments = courses.map((c) => ({
      code: c.code,
      name: c.name,
      students: c._count.enrollments,
    }));

    // Recent student admissions
    const recentStudents = await prisma.student.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
        department: { select: { name: true, code: true } },
      },
    });

    // Recent announcements
    const recentAnnouncements = await prisma.announcement.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { firstName: true, lastName: true, role: true } },
      },
    });

    return apiSuccess({
      stats: {
        totalStudents,
        totalFaculty,
        totalCourses,
        totalDepartments,
        avgAttendance,
      },
      departmentDistribution,
      courseEnrollments,
      recentStudents,
      recentAnnouncements,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return apiError("Failed to load admin analytics", 500);
  }
}

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { timetableSchema } from "@/schemas/timetable";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY", "STUDENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const semester = searchParams.get("semester");
    const section = searchParams.get("section");
    const facultyId = searchParams.get("facultyId");

    const where: any = {};

    if (departmentId && departmentId !== "ALL") where.departmentId = departmentId;
    if (semester && semester !== "ALL") where.semester = parseInt(semester, 10);
    if (section && section !== "ALL") where.section = section;
    if (facultyId) where.facultyId = facultyId;

    // If logged-in user is a student without explicit filters, show their enrolled courses' timetable
    if (auth.user!.role === "STUDENT" && !departmentId) {
      const student = await prisma.student.findUnique({
        where: { userId: auth.user!.id },
        include: { enrollments: true },
      });
      if (student) {
        const enrolledCourseIds = student.enrollments.map((e) => e.courseId);
        where.courseId = { in: enrolledCourseIds };
      }
    }

    const slots = await prisma.timetableSlot.findMany({
      where,
      include: {
        course: true,
        department: true,
        faculty: { include: { user: true } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return apiSuccess(slots);
  } catch (error) {
    console.error("Fetch timetable error:", error);
    return apiError("Failed to fetch timetable", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const result = timetableSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const data = result.data;

    const newSlot = await prisma.timetableSlot.create({
      data: {
        departmentId: data.departmentId,
        courseId: data.courseId,
        facultyId: data.facultyId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room,
        semester: data.semester,
        section: data.section,
      },
      include: {
        course: true,
        faculty: { include: { user: true } },
      },
    });

    return apiSuccess(newSlot, "Timetable slot added successfully", 201);
  } catch (error) {
    console.error("Create timetable slot error:", error);
    return apiError("Failed to add timetable slot", 500);
  }
}

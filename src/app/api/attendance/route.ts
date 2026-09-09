import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { submitAttendanceSchema } from "@/schemas/attendance";
import { apiSuccess, apiError } from "@/lib/api-response";
import { NotificationType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY", "STUDENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const studentId = searchParams.get("studentId");
    const facultyId = searchParams.get("facultyId");

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (facultyId) where.facultyId = facultyId;

    const sessions = await prisma.attendanceSession.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        course: true,
        faculty: { include: { user: true } },
        records: {
          where: studentId ? { studentId } : {},
          include: {
            student: {
              include: { user: true },
            },
          },
        },
      },
      take: 50,
    });

    return apiSuccess(sessions);
  } catch (error) {
    console.error("Fetch attendance error:", error);
    return apiError("Failed to fetch attendance records", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const result = submitAttendanceSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const { courseId, facultyId, date, slot, topic, records } = result.data;

    const session = await prisma.$transaction(async (tx) => {
      const newSession = await tx.attendanceSession.create({
        data: {
          courseId,
          facultyId,
          date: new Date(date),
          slot,
          topic,
        },
      });

      for (const record of records) {
        await tx.attendanceRecord.create({
          data: {
            sessionId: newSession.id,
            studentId: record.studentId,
            status: record.status,
            remarks: record.remarks,
          },
        });
      }

      return newSession;
    });

    // Background threshold check: If any student attendance falls below 75%, create an alert notification
    const threshold = parseInt(process.env.ATTENDANCE_WARNING_THRESHOLD || "75", 10);
    for (const record of records) {
      if (record.status === "ABSENT") {
        const total = await prisma.attendanceRecord.count({
          where: { studentId: record.studentId, session: { courseId } },
        });
        const present = await prisma.attendanceRecord.count({
          where: { studentId: record.studentId, session: { courseId }, status: "PRESENT" },
        });

        const pct = total > 0 ? (present / total) * 100 : 100;
        if (pct < threshold) {
          const student = await prisma.student.findUnique({
            where: { id: record.studentId },
            include: { user: true },
          });
          const course = await prisma.course.findUnique({ where: { id: courseId } });

          if (student && course) {
            await prisma.notification.create({
              data: {
                userId: student.userId,
                title: `Low Attendance Warning (${Math.round(pct)}%)`,
                message: `Your attendance in ${course.code} - ${course.name} has fallen to ${Math.round(pct)}%, which is below the required ${threshold}%.`,
                type: NotificationType.WARNING,
                link: "/attendance",
              },
            });
          }
        }
      }
    }

    return apiSuccess(session, "Attendance marked and saved successfully", 201);
  } catch (error) {
    console.error("Submit attendance error:", error);
    return apiError("Failed to submit attendance", 500);
  }
}

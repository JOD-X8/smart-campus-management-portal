import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY", "STUDENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q || q.trim().length < 2) {
      return apiSuccess({ students: [], faculty: [], courses: [], announcements: [] });
    }

    const query = q.trim();

    const [students, faculty, courses, announcements] = await Promise.all([
      // Students (only if ADMIN or FACULTY)
      auth.user!.role !== "STUDENT"
        ? prisma.student.findMany({
            where: {
              OR: [
                { studentId: { contains: query, mode: "insensitive" } },
                { user: { firstName: { contains: query, mode: "insensitive" } } },
                { user: { lastName: { contains: query, mode: "insensitive" } } },
              ],
            },
            take: 5,
            include: { user: true },
          })
        : [],

      // Faculty
      prisma.faculty.findMany({
        where: {
          OR: [
            { facultyId: { contains: query, mode: "insensitive" } },
            { designation: { contains: query, mode: "insensitive" } },
            { user: { firstName: { contains: query, mode: "insensitive" } } },
            { user: { lastName: { contains: query, mode: "insensitive" } } },
          ],
        },
        take: 5,
        include: { user: true },
      }),

      // Courses
      prisma.course.findMany({
        where: {
          OR: [
            { code: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),

      // Announcements
      prisma.announcement.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 4,
      }),
    ]);

    return apiSuccess({
      students,
      faculty,
      courses,
      announcements,
    });
  } catch (error) {
    console.error("Global search error:", error);
    return apiError("Failed to execute search", 500);
  }
}

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { courseSchema } from "@/schemas/course";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY", "STUDENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const departmentId = searchParams.get("departmentId");
    const semester = searchParams.get("semester");

    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (departmentId && departmentId !== "ALL") {
      where.departmentId = departmentId;
    }

    if (semester && semester !== "ALL") {
      where.semester = parseInt(semester, 10);
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { code: "asc" },
      include: {
        department: true,
        faculty: { include: { user: true } },
        _count: {
          select: { enrollments: true, attendanceSessions: true, assessments: true },
        },
      },
    });

    return apiSuccess(courses);
  } catch (error) {
    console.error("Fetch courses error:", error);
    return apiError("Failed to fetch courses", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const result = courseSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const data = result.data;

    const existingCode = await prisma.course.findUnique({ where: { code: data.code.toUpperCase() } });
    if (existingCode) return apiError("A course with this code already exists", 400);

    const newCourse = await prisma.course.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        credits: data.credits,
        departmentId: data.departmentId,
        semester: data.semester,
        academicYear: data.academicYear,
        facultyId: data.facultyId ? data.facultyId : null,
      },
      include: {
        department: true,
        faculty: { include: { user: true } },
      },
    });

    return apiSuccess(newCourse, "Course created successfully", 201);
  } catch (error) {
    console.error("Create course error:", error);
    return apiError("Failed to create course", 500);
  }
}

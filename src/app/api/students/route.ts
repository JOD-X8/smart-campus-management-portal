import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { studentSchema } from "@/schemas/student";
import { hashPassword } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY"]);
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const departmentId = searchParams.get("departmentId");
    const year = searchParams.get("year");
    const semester = searchParams.get("semester");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { studentId: { contains: search, mode: "insensitive" } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (departmentId && departmentId !== "ALL") {
      where.departmentId = departmentId;
    }

    if (year && year !== "ALL") {
      where.year = parseInt(year, 10);
    }

    if (semester && semester !== "ALL") {
      where.semester = parseInt(semester, 10);
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { studentId: "asc" },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, isActive: true } },
          department: { select: { id: true, name: true, code: true } },
        },
      }),
    ]);

    return apiSuccess(students, "Students retrieved successfully", 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Fetch students error:", error);
    return apiError("Failed to fetch students", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const result = studentSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const data = result.data;

    // Check existing email or studentId
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existingEmail) return apiError("A user with this email already exists", 400);

    const existingStudentId = await prisma.student.findUnique({ where: { studentId: data.studentId } });
    if (existingStudentId) return apiError("Student ID already exists", 400);

    const defaultPassword = data.password || "Student@123";
    const passwordHash = await hashPassword(defaultPassword);

    const newStudent = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          role: Role.STUDENT,
          firstName: data.firstName,
          lastName: data.lastName,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName}`,
        },
      });

      return tx.student.create({
        data: {
          studentId: data.studentId,
          userId: user.id,
          departmentId: data.departmentId,
          program: data.program,
          year: data.year,
          semester: data.semester,
          section: data.section,
          admissionYear: data.admissionYear,
          dob: data.dob ? new Date(data.dob) : null,
          gender: data.gender,
          phone: data.phone,
          status: data.status,
          cgpa: 0.0,
        },
        include: {
          user: true,
          department: true,
        },
      });
    });

    return apiSuccess(newStudent, "Student created successfully", 201);
  } catch (error) {
    console.error("Create student error:", error);
    return apiError("Failed to create student", 500);
  }
}

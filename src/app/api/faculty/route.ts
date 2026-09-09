import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { facultySchema } from "@/schemas/faculty";
import { hashPassword } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY", "STUDENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");

    const where: any = {};

    if (search) {
      where.OR = [
        { facultyId: { contains: search, mode: "insensitive" } },
        { designation: { contains: search, mode: "insensitive" } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (departmentId && departmentId !== "ALL") {
      where.departmentId = departmentId;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const facultyList = await prisma.faculty.findMany({
      where,
      orderBy: { facultyId: "asc" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, isActive: true } },
        department: { select: { id: true, name: true, code: true } },
        courses: { select: { id: true, code: true, name: true, credits: true } },
      },
    });

    return apiSuccess(facultyList);
  } catch (error) {
    console.error("Fetch faculty error:", error);
    return apiError("Failed to fetch faculty list", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const result = facultySchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const data = result.data;

    const existingEmail = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existingEmail) return apiError("A user with this email already exists", 400);

    const existingFacultyId = await prisma.faculty.findUnique({ where: { facultyId: data.facultyId } });
    if (existingFacultyId) return apiError("Faculty ID already exists", 400);

    const defaultPassword = data.password || "Faculty@123";
    const passwordHash = await hashPassword(defaultPassword);

    const newFaculty = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          role: Role.FACULTY,
          firstName: data.firstName,
          lastName: data.lastName,
          avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        },
      });

      return tx.faculty.create({
        data: {
          facultyId: data.facultyId,
          userId: user.id,
          departmentId: data.departmentId,
          designation: data.designation,
          qualification: data.qualification,
          phone: data.phone,
          status: data.status,
        },
        include: {
          user: true,
          department: true,
        },
      });
    });

    return apiSuccess(newFaculty, "Faculty member added successfully", 201);
  } catch (error) {
    console.error("Create faculty error:", error);
    return apiError("Failed to create faculty member", 500);
  }
}

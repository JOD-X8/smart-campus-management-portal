import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { departmentSchema } from "@/schemas/department";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN", "FACULTY", "STUDENT"]);
  if (!auth.authorized) return auth.response!;

  try {
    const departments = await prisma.department.findMany({
      orderBy: { code: "asc" },
      include: {
        _count: {
          select: {
            students: true,
            faculty: true,
            courses: true,
          },
        },
      },
    });

    return apiSuccess(departments);
  } catch (error) {
    console.error("Fetch departments error:", error);
    return apiError("Failed to fetch departments", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const result = departmentSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const data = result.data;

    const existingCode = await prisma.department.findUnique({
      where: { code: data.code.toUpperCase() },
    });
    if (existingCode) return apiError("A department with this code already exists", 400);

    const newDept = await prisma.department.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        hodName: data.hodName,
      },
      include: {
        _count: {
          select: { students: true, faculty: true, courses: true },
        },
      },
    });

    return apiSuccess(newDept, "Department created successfully", 201);
  } catch (error) {
    console.error("Create department error:", error);
    return apiError("Failed to create department", 500);
  }
}

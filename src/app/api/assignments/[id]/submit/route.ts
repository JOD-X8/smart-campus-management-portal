import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { submissionSchema } from "@/schemas/assignment";
import { apiSuccess, apiError } from "@/lib/api-response";
import { SubmissionStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["STUDENT", "ADMIN"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const result = submissionSchema.safeParse(body);

    if (!result.success) {
      return apiError(result.error.errors[0]?.message || "Validation failed", 400);
    }

    const { studentId, content, fileUrl } = result.data;

    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
    });

    if (!assignment) return apiError("Assignment not found", 404);

    const isLate = new Date() > new Date(assignment.dueDate);
    const status = isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED;

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: params.id,
          studentId,
        },
      },
      update: {
        content,
        fileUrl,
        submittedAt: new Date(),
        status,
      },
      create: {
        assignmentId: params.id,
        studentId,
        content,
        fileUrl,
        status,
      },
    });

    return apiSuccess(submission, isLate ? "Assignment submitted (Marked Late)" : "Assignment submitted successfully");
  } catch (error) {
    console.error("Submit assignment error:", error);
    return apiError("Failed to submit assignment", 500);
  }
}

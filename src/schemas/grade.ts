import { z } from "zod";

export const createAssessmentSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  facultyId: z.string().min(1, "Faculty is required"),
  title: z.string().min(3, "Assessment title is required"),
  type: z.enum(["ASSIGNMENT", "INTERNAL", "QUIZ", "MIDTERM", "FINAL_EXAM"]),
  maxMarks: z.coerce.number().min(1).default(100),
  weightage: z.coerce.number().min(1).max(100).default(20),
  date: z.string().optional(),
});

export const submitGradesSchema = z.object({
  assessmentId: z.string().min(1, "Assessment is required"),
  grades: z.array(
    z.object({
      studentId: z.string(),
      marksObtained: z.coerce.number().min(0),
      feedback: z.string().optional(),
    })
  ).min(1, "At least one grade record is required"),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type SubmitGradesInput = z.infer<typeof submitGradesSchema>;

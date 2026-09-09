import { z } from "zod";

export const assignmentSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  facultyId: z.string().min(1, "Faculty is required"),
  title: z.string().min(3, "Title is required"),
  description: z.string().min(5, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
  maxMarks: z.coerce.number().min(1).default(100),
  attachmentUrl: z.string().optional(),
});

export const submissionSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
});

export type AssignmentFormInput = z.infer<typeof assignmentSchema>;
export type SubmissionFormInput = z.infer<typeof submissionSchema>;

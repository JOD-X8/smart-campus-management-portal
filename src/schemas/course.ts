import { z } from "zod";

export const courseSchema = z.object({
  code: z.string().min(2, "Course code is required (e.g. CS301)"),
  name: z.string().min(3, "Course name is required"),
  description: z.string().optional(),
  credits: z.coerce.number().min(1).max(10).default(3),
  departmentId: z.string().min(1, "Department is required"),
  semester: z.coerce.number().min(1).max(10).default(1),
  academicYear: z.string().min(4, "Academic year is required (e.g. 2024-2025)"),
  facultyId: z.string().optional().or(z.literal("")),
});

export type CourseFormInput = z.infer<typeof courseSchema>;

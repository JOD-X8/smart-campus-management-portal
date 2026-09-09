import { z } from "zod";

export const studentSchema = z.object({
  studentId: z.string().min(3, "Student ID must be at least 3 characters"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  phone: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  program: z.string().min(1, "Program is required"), // e.g. B.Tech Computer Science
  year: z.coerce.number().min(1).max(5),
  semester: z.coerce.number().min(1).max(10),
  section: z.string().min(1, "Section is required"),
  admissionYear: z.coerce.number().min(2000).max(2030),
  gender: z.string().optional(),
  dob: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "ALUMNI"]).default("ACTIVE"),
});

export type StudentFormInput = z.infer<typeof studentSchema>;

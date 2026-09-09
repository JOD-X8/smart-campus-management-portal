import { z } from "zod";

export const facultySchema = z.object({
  facultyId: z.string().min(3, "Faculty ID must be at least 3 characters"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  phone: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  designation: z.string().min(2, "Designation is required"),
  qualification: z.string().min(2, "Qualification is required"),
  status: z.enum(["ACTIVE", "ON_LEAVE", "RETIRED"]).default("ACTIVE"),
});

export type FacultyFormInput = z.infer<typeof facultySchema>;

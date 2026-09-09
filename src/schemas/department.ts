import { z } from "zod";

export const departmentSchema = z.object({
  code: z.string().min(2, "Department code is required (e.g. CSE)"),
  name: z.string().min(3, "Department name is required"),
  description: z.string().optional(),
  hodName: z.string().optional(),
});

export type DepartmentFormInput = z.infer<typeof departmentSchema>;

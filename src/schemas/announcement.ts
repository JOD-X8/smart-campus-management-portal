import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().min(3, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  targetAudience: z.enum(["ALL", "FACULTY", "STUDENT", "DEPARTMENT"]).default("ALL"),
  departmentId: z.string().optional().or(z.literal("")),
  priority: z.enum(["NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  expiresAt: z.string().optional(),
});

export type AnnouncementFormInput = z.infer<typeof announcementSchema>;

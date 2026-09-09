import { z } from "zod";

export const timetableSchema = z.object({
  departmentId: z.string().min(1, "Department is required"),
  courseId: z.string().min(1, "Course is required"),
  facultyId: z.string().min(1, "Faculty is required"),
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
  startTime: z.string().min(4, "Start time required (e.g. 09:00)"),
  endTime: z.string().min(4, "End time required (e.g. 10:00)"),
  room: z.string().min(2, "Room / Hall required (e.g. Room 302)"),
  semester: z.coerce.number().min(1).max(10).default(1),
  section: z.string().min(1).default("A"),
});

export type TimetableFormInput = z.infer<typeof timetableSchema>;

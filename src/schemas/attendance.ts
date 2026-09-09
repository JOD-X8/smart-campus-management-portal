import { z } from "zod";

export const attendanceRecordSchema = z.object({
  studentId: z.string(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  remarks: z.string().optional(),
});

export const submitAttendanceSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  facultyId: z.string().min(1, "Faculty is required"),
  date: z.string().min(1, "Date is required"),
  slot: z.string().min(1, "Time slot is required"),
  topic: z.string().optional(),
  records: z.array(attendanceRecordSchema).min(1, "At least one attendance record is required"),
});

export type SubmitAttendanceInput = z.infer<typeof submitAttendanceSchema>;

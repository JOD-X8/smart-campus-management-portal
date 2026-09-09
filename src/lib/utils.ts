import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined, pattern = "MMM dd, yyyy"): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? parseISO(date) : date;
  return isNaN(d.getTime()) ? "Invalid Date" : format(d, pattern);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, "MMM dd, yyyy · hh:mm a");
}

export function calculateAttendancePercentage(present: number, total: number): number {
  if (!total || total <= 0) return 100;
  const percentage = (present / total) * 100;
  return Math.round(percentage * 10) / 10;
}

export function getAttendanceStatusColor(percentage: number): {
  color: string;
  badge: "success" | "warning" | "danger";
  isRisk: boolean;
} {
  if (percentage >= 85) {
    return { color: "text-emerald-600 dark:text-emerald-400", badge: "success", isRisk: false };
  }
  if (percentage >= 75) {
    return { color: "text-amber-600 dark:text-amber-400", badge: "warning", isRisk: false };
  }
  return { color: "text-rose-600 dark:text-rose-400", badge: "danger", isRisk: true };
}

export function calculateGrade(marks: number, maxMarks = 100): {
  percentage: number;
  grade: string;
  point: number;
  status: "PASS" | "FAIL";
} {
  const percentage = maxMarks > 0 ? (marks / maxMarks) * 100 : 0;
  if (percentage >= 90) return { percentage, grade: "A+", point: 10.0, status: "PASS" };
  if (percentage >= 80) return { percentage, grade: "A", point: 9.0, status: "PASS" };
  if (percentage >= 70) return { percentage, grade: "B+", point: 8.0, status: "PASS" };
  if (percentage >= 60) return { percentage, grade: "B", point: 7.0, status: "PASS" };
  if (percentage >= 50) return { percentage, grade: "C", point: 6.0, status: "PASS" };
  if (percentage >= 40) return { percentage, grade: "D", point: 5.0, status: "PASS" };
  return { percentage, grade: "F", point: 0.0, status: "FAIL" };
}

export function calculateCGPA(gradePoints: number[]): number {
  if (!gradePoints.length) return 0.0;
  const sum = gradePoints.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / gradePoints.length) * 100) / 100;
}

export function truncate(text: string, length = 60): string {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
}

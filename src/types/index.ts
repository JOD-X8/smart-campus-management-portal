export type Role = "ADMIN" | "FACULTY" | "STUDENT";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
export type AssessmentType = "ASSIGNMENT" | "INTERNAL" | "QUIZ" | "MIDTERM" | "FINAL_EXAM";
export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";
export type SubmissionStatus = "SUBMITTED" | "GRADED" | "LATE";
export type TargetAudience = "ALL" | "FACULTY" | "STUDENT" | "DEPARTMENT";
export type Priority = "NORMAL" | "HIGH" | "URGENT";
export type NotificationType = "INFO" | "WARNING" | "SUCCESS" | "ALERT";

export interface UserSummary {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  isActive: boolean;
}

export interface DepartmentSummary {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  hodName?: string | null;
  _count?: {
    students: number;
    faculty: number;
    courses: number;
  };
}

export interface FacultySummary {
  id: string;
  facultyId: string;
  userId: string;
  departmentId: string;
  designation: string;
  qualification: string;
  phone?: string | null;
  status: string;
  user: UserSummary;
  department: DepartmentSummary;
  _count?: {
    courses: number;
  };
}

export interface StudentSummary {
  id: string;
  studentId: string;
  userId: string;
  departmentId: string;
  program: string;
  year: number;
  semester: number;
  section: string;
  admissionYear: number;
  status: string;
  cgpa: number;
  phone?: string | null;
  gender?: string | null;
  dob?: string | null;
  user: UserSummary;
  department: DepartmentSummary;
}

export interface CourseSummary {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  credits: number;
  departmentId: string;
  semester: number;
  academicYear: string;
  facultyId?: string | null;
  department?: DepartmentSummary;
  faculty?: FacultySummary | null;
  _count?: {
    enrollments: number;
  };
}

export interface AttendanceRecordSummary {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  remarks?: string | null;
  student?: StudentSummary;
}

export interface AttendanceSessionSummary {
  id: string;
  courseId: string;
  facultyId: string;
  date: string;
  slot: string;
  topic?: string | null;
  course?: CourseSummary;
  faculty?: FacultySummary;
  records?: AttendanceRecordSummary[];
}

export interface AssessmentSummary {
  id: string;
  courseId: string;
  title: string;
  type: AssessmentType;
  maxMarks: number;
  weightage: number;
  date?: string | null;
  isPublished: boolean;
  course?: CourseSummary;
  grades?: {
    studentId: string;
    marksObtained: number;
  }[];
}

export interface TimetableSlotSummary {
  id: string;
  departmentId: string;
  courseId: string;
  facultyId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
  semester: number;
  section: string;
  course: CourseSummary;
  faculty: FacultySummary;
}

export interface AssignmentSummary {
  id: string;
  courseId: string;
  facultyId: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  attachmentUrl?: string | null;
  course?: CourseSummary;
  faculty?: FacultySummary;
  _count?: {
    submissions: number;
  };
  submissions?: {
    id: string;
    studentId: string;
    status: SubmissionStatus;
    marks?: number | null;
    submittedAt: string;
  }[];
}

export interface AnnouncementSummary {
  id: string;
  title: string;
  content: string;
  authorId: string;
  targetAudience: TargetAudience;
  departmentId?: string | null;
  priority: Priority;
  expiresAt?: string | null;
  createdAt: string;
  author: UserSummary;
  department?: DepartmentSummary | null;
}

export interface NotificationSummary {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

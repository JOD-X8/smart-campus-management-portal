"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetAttendanceSessionsQuery,
  useSubmitAttendanceMutation,
  useGetStudentAnalyticsQuery,
} from "@/store/api/apiSlice";
import { useAppSelector } from "@/store/hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  BookOpen,
} from "lucide-react";

function AttendanceContent() {
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  const isStudent = user?.role === "STUDENT";

  // Faculty / Admin state
  const { data: coursesData } = useGetCoursesQuery(undefined);
  const courses = coursesData?.data || [];
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || "");

  useEffect(() => {
    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const { data: singleCourseData, isLoading: isCourseLoading } = useGetCourseByIdQuery(
    selectedCourseId,
    { skip: !selectedCourseId || isStudent }
  );

  const course = singleCourseData?.data;
  const enrolledStudents = course?.enrollments?.map((e: any) => e.student) || [];

  // Attendance Submission State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState("09:00 - 10:00");
  const [topic, setTopic] = useState("");
  const [studentStatusMap, setStudentStatusMap] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE" | "EXCUSED">>({});

  useEffect(() => {
    if (enrolledStudents.length > 0) {
      const initialMap: Record<string, "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"> = {};
      enrolledStudents.forEach((s: any) => {
        initialMap[s.id] = "PRESENT"; // Default to present
      });
      setStudentStatusMap(initialMap);
    }
  }, [selectedCourseId, course]);

  const [submitAttendance, { isLoading: isSubmitting }] = useSubmitAttendanceMutation();

  const handleToggleStatus = (studentId: string, status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") => {
    setStudentStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: "PRESENT" | "ABSENT") => {
    const updated: Record<string, "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"> = {};
    enrolledStudents.forEach((s: any) => {
      updated[s.id] = status;
    });
    setStudentStatusMap(updated);
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || enrolledStudents.length === 0) return;

    const records = enrolledStudents.map((s: any) => ({
      studentId: s.id,
      status: studentStatusMap[s.id] || "PRESENT",
      remarks: studentStatusMap[s.id] === "ABSENT" ? "Absent during roll call" : "Attended",
    }));

    try {
      await submitAttendance({
        courseId: selectedCourseId,
        facultyId: course.facultyId || user?.id,
        date: attendanceDate,
        slot: timeSlot,
        topic: topic || "Regular Lecture",
        records,
      }).unwrap();

      showToast("Attendance Recorded", `Marked attendance for ${records.length} students`, "success");
      setTopic("");
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to submit attendance", "danger");
    }
  };

  // Student Perspective data
  const { data: studentAnalyticsData, isLoading: isStudentLoading } = useGetStudentAnalyticsQuery(
    undefined,
    { skip: !isStudent }
  );
  const studentMetrics = studentAnalyticsData?.data;

  // Render Student Perspective
  if (isStudent) {
    if (isStudentLoading) return <TableSkeleton rows={6} columns={4} />;

    const overallAttendance = studentMetrics?.overallAttendance || 0;
    const isAtRisk = overallAttendance < 75;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Attendance &amp; Academic Turnout
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time track record of classes attended and semester eligibility.
          </p>
        </div>

        {isAtRisk && (
          <Alert variant="danger" title="Attendance Below Minimum (75%)">
            Your cumulative attendance is currently <strong>{overallAttendance}%</strong>. You must attend upcoming lectures to qualify for semester final examinations.
          </Alert>
        )}

        {/* Overall Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Percentage</span>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{overallAttendance}%</span>
              <Badge variant={overallAttendance >= 85 ? "success" : overallAttendance >= 75 ? "warning" : "danger"}>
                {overallAttendance >= 85 ? "Eligible" : overallAttendance >= 75 ? "Satisfactory" : "At Risk"}
              </Badge>
            </div>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Subjects</span>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {studentMetrics?.courseAttendance?.length || 0}
              </span>
            </div>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Required Minimum</span>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">75.0%</span>
            </div>
          </Card>
        </div>

        {/* Subject-Wise Breakdown Table */}
        <Card className="overflow-hidden p-0">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Subject-Wise Attendance
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Attended / Total</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Standing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentMetrics?.courseAttendance?.map((c: any) => (
                <TableRow key={c.courseId}>
                  <TableCell className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                    {c.courseCode}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                    {c.courseName}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                    {c.attendedClasses} / {c.totalClasses} classes
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.percentage}%</span>
                      <div className="h-1.5 w-20 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            c.percentage >= 85 ? "bg-emerald-500" : c.percentage >= 75 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(c.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.percentage >= 85 ? "success" : c.percentage >= 75 ? "warning" : "danger"} size="sm">
                      {c.percentage >= 85 ? "Good Standing" : c.percentage >= 75 ? "Acceptable" : "Warning (<75%)"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  }

  // Faculty / Admin Perspective: Mark Attendance Roster
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Attendance Recording &amp; Roll Call
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Select course and date to record lecture attendance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleMarkAll("PRESENT")}>
            Mark All Present
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleMarkAll("ABSENT")}>
            Mark All Absent
          </Button>
        </div>
      </div>

      {/* Course & Session Selector Bar */}
      <Card className="p-5">
        <form onSubmit={handleSubmitAttendance} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Select Course"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              options={courses.map((c: any) => ({
                value: c.id,
                label: `${c.code} - ${c.name} (${c._count?.enrollments || 0} students)`,
              }))}
              required
            />

            <Input
              label="Date"
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              required
            />

            <Select
              label="Lecture Time Slot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              options={[
                { value: "09:00 - 10:00", label: "09:00 AM - 10:00 AM" },
                { value: "10:15 - 11:15", label: "10:15 AM - 11:15 AM" },
                { value: "11:30 - 12:30", label: "11:30 AM - 12:30 PM" },
                { value: "14:00 - 15:00", label: "02:00 PM - 03:00 PM" },
                { value: "15:15 - 16:15", label: "03:15 PM - 04:15 PM" },
              ]}
            />
          </div>

          <Input
            label="Lecture Topic Covered (Optional)"
            placeholder="e.g. Binary Search Trees & AVL Balancing"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          {/* Enrolled Students Roster */}
          <div className="pt-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center justify-between">
              <span>Enrolled Student Roster ({enrolledStudents.length})</span>
              <span className="text-xs font-normal text-slate-400">
                Click Present / Absent / Late to toggle
              </span>
            </h4>

            {isCourseLoading ? (
              <TableSkeleton rows={5} columns={4} />
            ) : enrolledStudents.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400 border rounded-xl">
                No students currently enrolled in this course. Use the Courses module to enroll students.
              </div>
            ) : (
              <div className="border rounded-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                {enrolledStudents.map((s: any) => {
                  const status = studentStatusMap[s.id] || "PRESENT";
                  return (
                    <div
                      key={s.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                          {s.user?.firstName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {s.user?.firstName} {s.user?.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {s.studentId} · Sec {s.section}
                          </p>
                        </div>
                      </div>

                      {/* Status Toggle Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(s.id, "PRESENT")}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                            status === "PRESENT"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(s.id, "ABSENT")}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                            status === "ABSENT"
                              ? "bg-rose-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(s.id, "LATE")}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                            status === "LATE"
                              ? "bg-amber-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="submit"
              size="md"
              disabled={enrolledStudents.length === 0}
              isLoading={isSubmitting}
              className="gap-2 shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" /> Submit Attendance Record
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} columns={5} />}>
      <AttendanceContent />
    </Suspense>
  );
}

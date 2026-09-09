"use client";

import React from "react";
import Link from "next/link";
import { useGetStudentAnalyticsQuery, useGetAiInsightsQuery } from "@/store/api/apiSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap,
  CalendarCheck,
  Award,
  BookOpen,
  Clock,
  Sparkles,
  FileText,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function StudentDashboard() {
  const { data, isLoading } = useGetStudentAnalyticsQuery(undefined);
  const { data: insightsData } = useGetAiInsightsQuery(undefined);

  const analytics = data?.data;
  const insights = insightsData?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const student = analytics?.student;
  const overallAttendance = analytics?.overallAttendance || 0;
  const isAttendanceAtRisk = overallAttendance < 75;

  return (
    <div className="space-y-6">
      {/* Student Identity Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl font-bold border border-white/20">
              {student?.user?.firstName?.charAt(0) || "S"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {student?.user?.firstName} {student?.user?.lastName}
                </h1>
                <Badge variant="primary" className="bg-white/20 text-white border-white/30 text-xs">
                  {student?.studentId}
                </Badge>
              </div>
              <p className="text-indigo-100 text-sm mt-0.5">
                {student?.program} · Semester {student?.semester} (Sec {student?.section})
              </p>
              <p className="text-xs text-indigo-200 mt-1">
                {student?.department?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/ai-assistant">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-indigo-900 hover:bg-slate-100 font-semibold gap-1.5 shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-amber-500" /> Ask AI Academic Assistant
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Attendance Risk Warning Alert if < 75% */}
      {isAttendanceAtRisk && (
        <Alert
          variant="danger"
          title="Attendance Action Required"
          className="border-rose-300 dark:border-rose-900"
        >
          Your cumulative campus attendance is currently <strong>{overallAttendance}%</strong>, which is below the mandatory university threshold (75%). Please review your subject-wise turnout below.
        </Alert>
      )}

      {/* Key Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cumulative GPA */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cumulative CGPA
            </span>
            <div className="rounded-xl p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {student?.cgpa?.toFixed(2) || "0.00"}
              <span className="text-sm font-normal text-slate-400 ml-1">/ 10.0</span>
            </h3>
            <p className="mt-1 text-xs text-slate-400 font-medium">Academic Grade Point Average</p>
          </div>
        </Card>

        {/* Overall Attendance with Progress Bar */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall Attendance
            </span>
            <div
              className={`rounded-xl p-2.5 ${
                overallAttendance >= 85
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                  : overallAttendance >= 75
                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/40"
              }`}
            >
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {overallAttendance}%
              </h3>
              <Badge
                variant={overallAttendance >= 85 ? "success" : overallAttendance >= 75 ? "warning" : "danger"}
                size="sm"
              >
                {overallAttendance >= 85 ? "Good" : overallAttendance >= 75 ? "Average" : "Low"}
              </Badge>
            </div>
            {/* Visual Attendance Progress Bar */}
            <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallAttendance >= 85
                    ? "bg-emerald-500"
                    : overallAttendance >= 75
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(overallAttendance, 100)}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Active Enrolled Courses */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Registered Courses
            </span>
            <div className="rounded-xl p-2.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {analytics?.courseAttendance?.length || 0}
            </h3>
            <p className="mt-1 text-xs text-slate-400 font-medium">Semester {student?.semester} credits</p>
          </div>
        </Card>

        {/* Due Assignments */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Due Assignments
            </span>
            <div className="rounded-xl p-2.5 bg-sky-50 text-sky-600 dark:bg-sky-950/40">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {analytics?.upcomingAssignments?.length || 0}
            </h3>
            <p className="mt-1 text-xs text-slate-400 font-medium">Active deadlines pending</p>
          </div>
        </Card>
      </div>

      {/* Main Grid: Subject Attendance Breakdown & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise Attendance Progress */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Subject-Wise Attendance Progress</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Minimum 75% attendance required for semester examination eligibility
              </p>
            </div>
            <Link href="/attendance" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
              Detailed Logs <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.courseAttendance?.map((course: any) => (
                <div key={course.courseId} className="space-y-1.5 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {course.courseCode} · {course.courseName}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {course.attendedClasses} / {course.totalClasses} classes (
                      <strong
                        className={
                          course.percentage >= 85
                            ? "text-emerald-600 dark:text-emerald-400"
                            : course.percentage >= 75
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                        }
                      >
                        {course.percentage}%
                      </strong>
                      )
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        course.percentage >= 85
                          ? "bg-emerald-500"
                          : course.percentage >= 75
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(course.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Today&apos;s Classes</CardTitle>
            <Link href="/timetable" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
              Timetable <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {analytics?.todaySchedule?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No classes scheduled for today.
              </div>
            ) : (
              <div className="space-y-3">
                {analytics?.todaySchedule?.map((slot: any) => (
                  <div
                    key={slot.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 shrink-0 mt-0.5">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {slot.course.code} - {slot.course.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {slot.startTime} - {slot.endTime} · Room: <span className="font-semibold text-slate-700 dark:text-slate-300">{slot.room}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Prof. {slot.faculty.user.firstName} {slot.faculty.user.lastName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Performance Insights & Recent Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Performance Insights Widget */}
        <Card className="border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-b from-white to-indigo-50/20 dark:from-slate-900 dark:to-indigo-950/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">AI Performance Insights</CardTitle>
            </div>
            <Link href="/ai-assistant" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
              Ask Assistant <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">
                Analyzing your current semester metrics. Keep attending classes and completing assignments!
              </p>
            ) : (
              <div className="space-y-3">
                {insights.slice(0, 3).map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white dark:bg-slate-800/80 dark:border-slate-700 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {item.type === "danger" ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                        {item.title}
                      </span>
                      <Badge
                        variant={item.type === "danger" ? "danger" : item.type === "warning" ? "warning" : "success"}
                        size="sm"
                      >
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                    {item.actionLabel && item.actionUrl && (
                      <div className="pt-1">
                        <Link
                          href={item.actionUrl}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                        >
                          {item.actionLabel} →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Evaluation Grades */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Assessment Marks</CardTitle>
            <Link href="/grades" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
              Full Transcript <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {analytics?.recentGrades?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No evaluation marks published yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics?.recentGrades?.map((g: any) => {
                  const pct = Math.round((g.marksObtained / g.assessment.maxMarks) * 100);
                  return (
                    <div key={g.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {g.assessment.course.code} · {g.assessment.title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Evaluated: {new Date(g.gradedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {g.marksObtained} / {g.assessment.maxMarks}
                        </span>
                        <p
                          className={`text-[11px] font-semibold ${
                            pct >= 80
                              ? "text-emerald-600"
                              : pct >= 60
                              ? "text-indigo-600"
                              : "text-rose-600"
                          }`}
                        >
                          {pct}% Score
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

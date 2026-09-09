"use client";

import React, { useState } from "react";
import {
  useGetAdminAnalyticsQuery,
  useCreateAnnouncementMutation,
  useCreateStudentMutation,
  useCreateCourseMutation,
  useGetDepartmentsQuery,
} from "@/store/api/apiSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  Users,
  UserCheck,
  BookOpen,
  Building2,
  CalendarCheck,
  PlusCircle,
  Megaphone,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
  const { data, isLoading, refetch } = useGetAdminAnalyticsQuery(undefined);
  const { data: deptData } = useGetDepartmentsQuery(undefined);
  const { showToast } = useToast();

  // Quick Action Modals
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [createAnnouncement, { isLoading: isAnnouncing }] = useCreateAnnouncementMutation();
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annAudience, setAnnAudience] = useState("ALL");
  const [annPriority, setAnnPriority] = useState("NORMAL");

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [createCourse, { isLoading: isCreatingCourse }] = useCreateCourseMutation();
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCredits, setCourseCredits] = useState("3");
  const [courseDept, setCourseDept] = useState("");

  const analytics = data?.data;
  const departments = deptData?.data || [];

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    try {
      await createAnnouncement({
        title: annTitle,
        content: annContent,
        targetAudience: annAudience,
        priority: annPriority,
      }).unwrap();
      showToast("Success", "Announcement broadcasted successfully", "success");
      setIsAnnouncementModalOpen(false);
      setAnnTitle("");
      setAnnContent("");
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to post announcement", "danger");
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseName || !courseDept) {
      showToast("Missing Fields", "Please complete required fields", "warning");
      return;
    }

    try {
      await createCourse({
        code: courseCode,
        name: courseName,
        credits: parseInt(courseCredits, 10),
        departmentId: courseDept,
        semester: 1,
        academicYear: "2024-2025",
      }).unwrap();
      showToast("Success", `Course ${courseCode} registered`, "success");
      setIsCourseModalOpen(false);
      setCourseCode("");
      setCourseName("");
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to add course", "danger");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const stats = analytics?.stats || {
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalDepartments: 0,
    avgAttendance: 0,
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: <Users className="h-5 w-5 text-indigo-600" />,
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      change: "+12% this term",
    },
    {
      title: "Faculty Members",
      value: stats.totalFaculty,
      icon: <UserCheck className="h-5 w-5 text-emerald-600" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      change: "Active & assigned",
    },
    {
      title: "Active Courses",
      value: stats.totalCourses,
      icon: <BookOpen className="h-5 w-5 text-sky-600" />,
      bg: "bg-sky-50 dark:bg-sky-950/40",
      change: "Fall 2024 catalog",
    },
    {
      title: "Departments",
      value: stats.totalDepartments,
      icon: <Building2 className="h-5 w-5 text-amber-600" />,
      bg: "bg-amber-50 dark:bg-amber-950/40",
      change: "Engineering & Sciences",
    },
    {
      title: "Avg Attendance",
      value: `${stats.avgAttendance}%`,
      icon: <CalendarCheck className="h-5 w-5 text-indigo-600" />,
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      change: "Campus-wide benchmark",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Campus Administrator Console
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time university operations, academic distributions, and campus telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAnnouncementModalOpen(true)}
            className="gap-1.5"
          >
            <Megaphone className="h-4 w-4" /> Broadcast Announcement
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCourseModalOpen(true)}
            className="gap-1.5 shadow-sm"
          >
            <PlusCircle className="h-4 w-4" /> Add Course
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.title}
              </span>
              <div className={`rounded-xl p-2.5 ${stat.bg}`}>{stat.icon}</div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</h3>
              <p className="mt-1 text-xs text-slate-400 flex items-center gap-1 font-medium">
                <TrendingUp className="h-3 w-3 text-emerald-500" /> {stat.change}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Department Distribution</span>
              <Badge variant="primary">Students &amp; Faculty</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {analytics?.departmentDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.departmentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderRadius: "0.75rem",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="students" name="Students" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="faculty" name="Faculty" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No department data available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Enrollment Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Course Enrollment Counts</span>
              <Badge variant="secondary">Top Registered</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {analytics?.courseEnrollments?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={analytics.courseEnrollments}
                  margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis type="category" dataKey="code" stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderRadius: "0.75rem",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="students" name="Enrolled Students" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No enrollment data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity: Admissions & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Student Admissions</CardTitle>
            <a href="/students" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </a>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {analytics?.recentStudents?.map((s: any) => (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                      {s.user.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {s.user.firstName} {s.user.lastName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {s.studentId} · {s.department?.name || "General"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Campus Bulletin &amp; Broadcasts</CardTitle>
            <a href="/announcements" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View Feed <ArrowUpRight className="h-3 w-3" />
            </a>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.recentAnnouncements?.map((a: any) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{a.title}</h5>
                    <Badge variant={a.priority === "URGENT" ? "danger" : "default"} size="sm">
                      {a.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{a.content}</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Published by {a.author.firstName} ({a.author.role})
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Broadcast Announcement Modal */}
      <Modal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title="Post University Announcement"
        description="Broadcast official circulars to students, faculty, or all campus members."
      >
        <form onSubmit={handlePostAnnouncement} className="space-y-4">
          <Input
            label="Announcement Title"
            value={annTitle}
            onChange={(e) => setAnnTitle(e.target.value)}
            placeholder="e.g. Midterm Examination Schedule Announcement"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Target Audience"
              value={annAudience}
              onChange={(e) => setAnnAudience(e.target.value)}
              options={[
                { value: "ALL", label: "All Campus Members" },
                { value: "STUDENT", label: "Students Only" },
                { value: "FACULTY", label: "Faculty Only" },
              ]}
            />

            <Select
              label="Priority Level"
              value={annPriority}
              onChange={(e) => setAnnPriority(e.target.value)}
              options={[
                { value: "NORMAL", label: "Normal Notice" },
                { value: "HIGH", label: "High Priority" },
                { value: "URGENT", label: "Urgent Alert" },
              ]}
            />
          </div>

          <Textarea
            label="Notice Content"
            value={annContent}
            onChange={(e) => setAnnContent(e.target.value)}
            placeholder="Provide complete circular details..."
            rows={4}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAnnouncementModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isAnnouncing}>
              Publish Announcement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Course Quick Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Register New Academic Course"
        description="Add a course curriculum to the university catalog."
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Course Code"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. CS401"
              required
            />
            <Input
              label="Credits"
              type="number"
              value={courseCredits}
              onChange={(e) => setCourseCredits(e.target.value)}
              min={1}
              max={8}
              required
            />
          </div>

          <Input
            label="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="e.g. Distributed Operating Systems"
            required
          />

          <Select
            label="Department"
            value={courseDept}
            onChange={(e) => setCourseDept(e.target.value)}
            options={[
              { value: "", label: "Select Academic Department" },
              ...departments.map((d: any) => ({ value: d.id, label: `${d.code} - ${d.name}` })),
            ]}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCourseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isCreatingCourse}>
              Register Course
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

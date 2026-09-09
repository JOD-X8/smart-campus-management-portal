"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useGetFacultyAnalyticsQuery,
  useCreateAnnouncementMutation,
  useGetAnnouncementsQuery,
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
  BookOpen,
  Users,
  CalendarCheck,
  ClipboardList,
  Clock,
  ArrowRight,
  PlusCircle,
  Megaphone,
  CheckCircle,
} from "lucide-react";

export default function FacultyDashboard() {
  const { data, isLoading } = useGetFacultyAnalyticsQuery(undefined);
  const { data: annData } = useGetAnnouncementsQuery({ targetAudience: "FACULTY" });
  const { showToast } = useToast();

  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [createAnnouncement, { isLoading: isPosting }] = useCreateAnnouncementMutation();
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annAudience, setAnnAudience] = useState("STUDENT");

  const analytics = data?.data;
  const announcements = annData?.data || [];

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    try {
      await createAnnouncement({
        title: annTitle,
        content: annContent,
        targetAudience: annAudience,
        priority: "NORMAL",
      }).unwrap();
      showToast("Success", "Announcement posted to your students", "success");
      setIsAnnounceModalOpen(false);
      setAnnTitle("");
      setAnnContent("");
    } catch {
      showToast("Error", "Failed to post announcement", "danger");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
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

  const statCards = [
    {
      title: "Assigned Courses",
      value: analytics?.assignedCourses || 0,
      icon: <BookOpen className="h-5 w-5 text-indigo-600" />,
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      description: "Active teaching load",
    },
    {
      title: "Total Students",
      value: analytics?.totalStudents || 0,
      icon: <Users className="h-5 w-5 text-emerald-600" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      description: "Enrolled in your subjects",
    },
    {
      title: "Avg Attendance",
      value: `${analytics?.attendanceRate || 0}%`,
      icon: <CalendarCheck className="h-5 w-5 text-amber-600" />,
      bg: "bg-amber-50 dark:bg-amber-950/40",
      description: "Overall student turnout",
    },
    {
      title: "Submissions to Grade",
      value: analytics?.pendingSubmissions || 0,
      icon: <ClipboardList className="h-5 w-5 text-rose-600" />,
      bg: "bg-rose-50 dark:bg-rose-950/40",
      description: "Pending assessment review",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Faculty Instructor Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage course lectures, mark student attendance, review assignments, and post marks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/attendance">
            <Button variant="primary" size="sm" className="gap-1.5">
              <CalendarCheck className="h-4 w-4" /> Mark Attendance
            </Button>
          </Link>
          <Link href="/grades">
            <Button variant="outline" size="sm" className="gap-1.5">
              <CheckCircle className="h-4 w-4" /> Enter Marks
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAnnounceModalOpen(true)}
            className="gap-1.5"
          >
            <Megaphone className="h-4 w-4" /> Post Notice
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {stat.title}
              </span>
              <div className={`rounded-xl p-2.5 ${stat.bg}`}>{stat.icon}</div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</h3>
              <p className="mt-1 text-xs text-slate-400 font-medium">{stat.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Teaching Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Today&apos;s Class Schedule</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Assigned lecture slots for the day</p>
            </div>
            <Link href="/timetable" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              Full Timetable <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {analytics?.todayClasses?.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                No classes scheduled for today. Enjoy your day!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics?.todayClasses?.map((c: any) => (
                  <div key={c.id} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-xs">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {c.course.name} ({c.course.code})
                        </h4>
                        <p className="text-xs text-slate-400">
                          Room: <span className="font-semibold text-slate-700 dark:text-slate-300">{c.room}</span> · Semester {c.semester} (Section {c.section})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="primary" size="md">
                        {c.startTime} - {c.endTime}
                      </Badge>
                      <Link href={`/attendance?courseId=${c.courseId}`}>
                        <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                          Mark Attendance
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Courses Roster */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assigned Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.courses?.map((course: any) => (
                <div
                  key={course.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{course.code}</span>
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{course.name}</h5>
                    </div>
                    <Badge variant="default" size="sm">
                      {course.credits} Credits
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                    <span className="text-slate-400">Semester {course.semester}</span>
                    <Link
                      href={`/attendance?courseId=${course.id}`}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      Roster &amp; Attendance →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={isAnnounceModalOpen}
        onClose={() => setIsAnnounceModalOpen(false)}
        title="Post Notice for Students"
        description="Share class updates, assignment hints, or schedule notifications."
      >
        <form onSubmit={handlePostAnnouncement} className="space-y-4">
          <Input
            label="Notice Title"
            value={annTitle}
            onChange={(e) => setAnnTitle(e.target.value)}
            placeholder="e.g. Lab 4 Assignment Clarification"
            required
          />

          <Select
            label="Target Audience"
            value={annAudience}
            onChange={(e) => setAnnAudience(e.target.value)}
            options={[
              { value: "STUDENT", label: "Students" },
              { value: "ALL", label: "All Campus Members" },
            ]}
          />

          <Textarea
            label="Content"
            value={annContent}
            onChange={(e) => setAnnContent(e.target.value)}
            placeholder="Write your announcement details..."
            rows={4}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAnnounceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isPosting}>
              Broadcast Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  useGetTimetableQuery,
  useCreateTimetableSlotMutation,
  useDeleteTimetableSlotMutation,
  useGetCoursesQuery,
  useGetFacultyListQuery,
  useGetDepartmentsQuery,
} from "@/store/api/apiSlice";
import { useAppSelector } from "@/store/hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  PlusCircle,
  Trash2,
  BookOpen,
} from "lucide-react";
import { DayOfWeek } from "@/types";

const DAYS_OF_WEEK: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export default function TimetablePage() {
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();
  const isAdminOrFaculty = user?.role === "ADMIN" || user?.role === "FACULTY";

  const [activeTab, setActiveTab] = useState("weekly");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [semesterFilter, setSemesterFilter] = useState("3");

  const { data, isLoading } = useGetTimetableQuery({
    departmentId: departmentFilter !== "ALL" ? departmentFilter : undefined,
    semester: semesterFilter !== "ALL" ? semesterFilter : undefined,
  });

  const { data: coursesData } = useGetCoursesQuery(undefined);
  const { data: facultyData } = useGetFacultyListQuery(undefined);
  const { data: deptData } = useGetDepartmentsQuery(undefined);

  const courses = coursesData?.data || [];
  const facultyMembers = facultyData?.data || [];
  const departments = deptData?.data || [];
  const timetableSlots = data?.data || [];

  const [createSlot, { isLoading: isCreating }] = useCreateTimetableSlotMutation();
  const [deleteSlot, { isLoading: isDeleting }] = useDeleteTimetableSlotMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);

  const [slotForm, setSlotForm] = useState({
    departmentId: "",
    courseId: "",
    facultyId: "",
    dayOfWeek: "MONDAY",
    startTime: "09:00",
    endTime: "10:00",
    room: "Hall 301",
    semester: "3",
    section: "A",
  });

  const handleOpenAdd = () => {
    setSlotForm({
      departmentId: departments[0]?.id || "",
      courseId: courses[0]?.id || "",
      facultyId: facultyMembers[0]?.id || "",
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "10:00",
      room: "Hall 301",
      semester: "3",
      section: "A",
    });
    setIsModalOpen(true);
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSlot({
        ...slotForm,
        semester: parseInt(slotForm.semester, 10),
      }).unwrap();
      showToast("Scheduled", "Timetable slot added successfully", "success");
      setIsModalOpen(false);
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to schedule slot", "danger");
    }
  };

  const handleDeleteSlot = async () => {
    if (!deletingSlotId) return;
    try {
      await deleteSlot(deletingSlotId).unwrap();
      showToast("Deleted", "Slot removed from schedule", "success");
      setDeletingSlotId(null);
    } catch {
      showToast("Error", "Failed to delete slot", "danger");
    }
  };

  // Group slots by day
  const slotsByDay: Record<string, any[]> = {};
  DAYS_OF_WEEK.forEach((day) => {
    slotsByDay[day] = timetableSlots
      .filter((s: any) => s.dayOfWeek === day)
      .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
  });

  // Today's classes
  const dayIndex = new Date().getDay(); // 0 is Sunday
  const todayEnum = dayIndex >= 1 && dayIndex <= 6 ? DAYS_OF_WEEK[dayIndex - 1] : "MONDAY";
  const todaySlots = slotsByDay[todayEnum] || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Timetable &amp; Schedule Planner
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Weekly lecture schedules, laboratory periods, and venue assignments.
          </p>
        </div>

        {isAdminOrFaculty && (
          <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 self-start sm:self-auto">
            <PlusCircle className="h-4 w-4" /> Add Schedule Slot
          </Button>
        )}
      </div>

      {/* Filter and View Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Tabs
          tabs={[
            { id: "weekly", label: "Weekly Schedule Grid" },
            { id: "today", label: `Today's Schedule (${todayEnum})` },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab)}
        />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All Departments" },
              ...departments.map((d: any) => ({ value: d.id, label: d.code })),
            ]}
          />
          <Select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All Semesters" },
              ...Array.from({ length: 8 }, (_, i) => ({
                value: (i + 1).toString(),
                label: `Semester ${i + 1}`,
              })),
            ]}
          />
        </div>
      </div>

      {/* Today's Schedule View */}
      {activeTab === "today" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <span>Classes for {todayEnum}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySlots.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                No classes scheduled for {todayEnum}.
              </div>
            ) : (
              <div className="relative border-l-2 border-indigo-200 dark:border-indigo-900 ml-4 space-y-6 py-2">
                {todaySlots.map((slot: any) => (
                  <div key={slot.id} className="relative pl-6">
                    {/* Timeline Node dot */}
                    <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-indigo-600 dark:border-slate-900" />
                    <div className="p-4 rounded-xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {slot.course.code}
                          </span>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                            {slot.course.name}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {slot.room}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            Prof. {slot.faculty.user.firstName} {slot.faculty.user.lastName}
                          </span>
                        </div>
                      </div>

                      {isAdminOrFaculty && (
                        <button
                          onClick={() => setDeletingSlotId(slot.id)}
                          className="text-slate-400 hover:text-rose-500 self-end sm:self-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Weekly Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayClasses = slotsByDay[day] || [];
            return (
              <div key={day} className="space-y-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-center font-bold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  {day}
                </div>

                <div className="space-y-2.5 min-h-[14rem]">
                  {dayClasses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center text-[11px] text-slate-400">
                      No classes
                    </div>
                  ) : (
                    dayClasses.map((slot: any) => (
                      <div
                        key={slot.id}
                        className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 transition-all text-left group"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                          <span>{slot.startTime} - {slot.endTime}</span>
                          {isAdminOrFaculty && (
                            <button
                              onClick={() => setDeletingSlotId(slot.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-xs leading-snug line-clamp-1">
                          {slot.course.code} · {slot.course.name}
                        </h5>

                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">{slot.room}</span>
                          <span className="truncate max-w-[80px]">
                            {slot.faculty?.user?.lastName}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Slot Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Timetable Slot"
        description="Assign course timeslot, room number, and faculty instructor."
      >
        <form onSubmit={handleCreateSlot} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Course"
              value={slotForm.courseId}
              onChange={(e) => setSlotForm({ ...slotForm, courseId: e.target.value })}
              options={courses.map((c: any) => ({ value: c.id, label: `${c.code} - ${c.name}` }))}
              required
            />
            <Select
              label="Department"
              value={slotForm.departmentId}
              onChange={(e) => setSlotForm({ ...slotForm, departmentId: e.target.value })}
              options={departments.map((d: any) => ({ value: d.id, label: d.code }))}
              required
            />
          </div>

          <Select
            label="Assigned Faculty"
            value={slotForm.facultyId}
            onChange={(e) => setSlotForm({ ...slotForm, facultyId: e.target.value })}
            options={facultyMembers.map((f: any) => ({
              value: f.id,
              label: `Prof. ${f.user.firstName} ${f.user.lastName}`,
            }))}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Day of Week"
              value={slotForm.dayOfWeek}
              onChange={(e) => setSlotForm({ ...slotForm, dayOfWeek: e.target.value })}
              options={DAYS_OF_WEEK.map((d) => ({ value: d, label: d }))}
            />
            <Input
              label="Start Time"
              type="time"
              value={slotForm.startTime}
              onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={slotForm.endTime}
              onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Room / Hall"
              value={slotForm.room}
              onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
              placeholder="Hall 301"
              required
            />
            <Input
              label="Semester"
              type="number"
              value={slotForm.semester}
              onChange={(e) => setSlotForm({ ...slotForm, semester: e.target.value })}
              required
            />
            <Input
              label="Section"
              value={slotForm.section}
              onChange={(e) => setSlotForm({ ...slotForm, section: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isCreating}>
              Schedule Slot
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingSlotId}
        onClose={() => setDeletingSlotId(null)}
        onConfirm={handleDeleteSlot}
        title="Remove Timetable Slot"
        description="Are you sure you want to delete this lecture slot from the schedule?"
        confirmText="Yes, Delete Slot"
        isLoading={isDeleting}
      />
    </div>
  );
}

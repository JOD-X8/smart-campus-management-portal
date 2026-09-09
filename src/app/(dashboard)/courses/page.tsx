"use client";

import React, { useState } from "react";
import {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useAssignStudentsToCourseMutation,
  useGetDepartmentsQuery,
  useGetFacultyListQuery,
  useGetStudentsQuery,
} from "@/store/api/apiSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
  BookOpen,
  PlusCircle,
  Search,
  Users,
  UserCheck,
  Edit2,
  Trash2,
  GraduationCap,
  Calendar,
  CheckSquare,
} from "lucide-react";

export default function CoursesPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("ALL");
  const [semesterFilter, setSemesterFilter] = useState("ALL");

  const { data, isLoading } = useGetCoursesQuery({
    search,
    departmentId,
    semester: semesterFilter,
  });

  const { data: deptData } = useGetDepartmentsQuery(undefined);
  const { data: facData } = useGetFacultyListQuery(undefined);
  const { data: stuData } = useGetStudentsQuery({ limit: "50" });

  const departments = deptData?.data || [];
  const facultyMembers = facData?.data || [];
  const students = stuData?.data || [];

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const [assignStudents, { isLoading: isEnrolling }] = useAssignStudentsToCourseMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  // Enrollment modal
  const [enrollingCourse, setEnrollingCourse] = useState<any>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    credits: "3",
    departmentId: "",
    semester: "1",
    academicYear: "2024-2025",
    facultyId: "",
  });

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      credits: "3",
      departmentId: departments[0]?.id || "",
      semester: "1",
      academicYear: "2024-2025",
      facultyId: facultyMembers[0]?.id || "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: any) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      description: course.description || "",
      credits: course.credits.toString(),
      departmentId: course.departmentId,
      semester: course.semester.toString(),
      academicYear: course.academicYear,
      facultyId: course.facultyId || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse({
          id: editingCourse.id,
          ...formData,
          credits: parseInt(formData.credits, 10),
          semester: parseInt(formData.semester, 10),
        }).unwrap();
        showToast("Updated", "Course catalog updated", "success");
      } else {
        await createCourse({
          ...formData,
          credits: parseInt(formData.credits, 10),
          semester: parseInt(formData.semester, 10),
        }).unwrap();
        showToast("Created", "Course added to syllabus", "success");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to save course", "danger");
    }
  };

  const handleDelete = async () => {
    if (!deletingCourseId) return;
    try {
      await deleteCourse(deletingCourseId).unwrap();
      showToast("Deleted", "Course removed from catalog", "success");
      setDeletingCourseId(null);
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to delete course", "danger");
    }
  };

  const handleOpenEnroll = (course: any) => {
    setEnrollingCourse(course);
    setSelectedStudentIds([]);
  };

  const handleToggleStudentSelection = (sId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(sId) ? prev.filter((id) => id !== sId) : [...prev, sId]
    );
  };

  const handleEnrollSubmit = async () => {
    if (!enrollingCourse || selectedStudentIds.length === 0) return;
    try {
      await assignStudents({
        courseId: enrollingCourse.id,
        studentIds: selectedStudentIds,
      }).unwrap();
      showToast("Enrolled", `Assigned ${selectedStudentIds.length} students to ${enrollingCourse.code}`, "success");
      setEnrollingCourse(null);
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to enroll students", "danger");
    }
  };

  const courses = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Course Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Curriculum subjects, credit weightage, faculty allocations, and student rosters.
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 self-start sm:self-auto">
          <PlusCircle className="h-4 w-4" /> Add New Course
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            placeholder="Search by course code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />

          <Select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={[
              { value: "ALL", label: "All Departments" },
              ...departments.map((d: any) => ({ value: d.id, label: `${d.code} - ${d.name}` })),
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
      </Card>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : courses.length === 0 ? (
          <EmptyState
            title="No courses found"
            description="Adjust your search filters or add a new subject to the curriculum."
            actionLabel="Add Course"
            onAction={handleOpenAdd}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code &amp; Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course: any) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                        {course.code}
                      </span>
                      <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {course.name}
                      </h5>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {course.department?.code}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary" size="sm">
                      {course.credits} Credits
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500">Sem {course.semester}</span>
                  </TableCell>
                  <TableCell>
                    {course.faculty ? (
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        Prof. {course.faculty.user?.firstName} {course.faculty.user?.lastName}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {course._count?.enrollments || 0} students
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEnroll(course)}
                        className="text-xs gap-1 py-1 h-7"
                        title="Enroll Students"
                      >
                        <Users className="h-3.5 w-3.5" /> Enroll
                      </Button>
                      <button
                        onClick={() => handleOpenEdit(course)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Course"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCourseId(course.id)}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? "Edit Course Syllabus" : "Register Academic Course"}
        description="Configure credits, department, and assign course instructor."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Course Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. CS305"
              required
            />
            <Input
              label="Credits"
              type="number"
              min={1}
              max={10}
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
              required
            />
          </div>

          <Input
            label="Course Title"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Artificial Intelligence & Expert Systems"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Department"
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              options={departments.map((d: any) => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
              required
            />
            <Select
              label="Semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              options={Array.from({ length: 8 }, (_, i) => ({
                value: (i + 1).toString(),
                label: `Semester ${i + 1}`,
              }))}
            />
          </div>

          <Select
            label="Assign Course Faculty"
            value={formData.facultyId}
            onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
            options={[
              { value: "", label: "-- Select Instructor --" },
              ...facultyMembers.map((f: any) => ({
                value: f.id,
                label: `Prof. ${f.user.firstName} ${f.user.lastName} (${f.facultyId})`,
              })),
            ]}
          />

          <Textarea
            label="Course Description &amp; Syllabus"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isCreating || isUpdating}>
              {editingCourse ? "Update Course" : "Add Course"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Enrollment Modal */}
      <Modal
        isOpen={!!enrollingCourse}
        onClose={() => setEnrollingCourse(null)}
        title={`Assign Students to ${enrollingCourse?.code}`}
        description={`Select students to register into ${enrollingCourse?.name}.`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl p-2">
            {students.map((s: any) => {
              const isSelected = selectedStudentIds.includes(s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => handleToggleStudentSelection(s.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "bg-indigo-50 dark:bg-indigo-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by div click
                      className="h-4 w-4 rounded text-indigo-600 pointer-events-none"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {s.user.firstName} {s.user.lastName} ({s.studentId})
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Year {s.year} · Sem {s.semester} · Sec {s.section}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{s.department?.code}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {selectedStudentIds.length} student(s) selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEnrollingCourse(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleEnrollSubmit}
                disabled={selectedStudentIds.length === 0}
                isLoading={isEnrolling}
              >
                Confirm Enrollment
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCourseId}
        onClose={() => setDeletingCourseId(null)}
        onConfirm={handleDelete}
        title="Delete Academic Course"
        description="Are you sure you want to remove this course from the university catalog? Active enrollments, assessments, and attendance records will be affected."
        confirmText="Yes, Delete Course"
        isLoading={isDeleting}
      />
    </div>
  );
}

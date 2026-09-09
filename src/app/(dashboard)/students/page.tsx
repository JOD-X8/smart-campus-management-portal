"use client";

import React, { useState } from "react";
import {
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetDepartmentsQuery,
} from "@/store/api/apiSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Building,
} from "lucide-react";

export default function StudentsManagementPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetStudentsQuery({
    search,
    departmentId,
    year: yearFilter,
    status: statusFilter,
    page: page.toString(),
    limit: "10",
  });

  const { data: deptData } = useGetDepartmentsQuery(undefined);
  const departments = deptData?.data || [];

  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [viewingStudent, setViewingStudent] = useState<any>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    departmentId: "",
    program: "B.Tech Computer Science & Engineering",
    year: "1",
    semester: "1",
    section: "A",
    admissionYear: "2024",
    gender: "Male",
    status: "ACTIVE",
  });

  const handleOpenAdd = () => {
    setFormData({
      studentId: `STU-2024-${Math.floor(100 + Math.random() * 900)}`,
      firstName: "",
      lastName: "",
      email: "",
      password: "Student@123",
      phone: "",
      departmentId: departments[0]?.id || "",
      program: "B.Tech Computer Science & Engineering",
      year: "1",
      semester: "1",
      section: "A",
      admissionYear: "2024",
      gender: "Male",
      status: "ACTIVE",
    });
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      studentId: student.studentId,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      password: "",
      phone: student.phone || "",
      departmentId: student.departmentId,
      program: student.program,
      year: student.year.toString(),
      semester: student.semester.toString(),
      section: student.section,
      admissionYear: student.admissionYear.toString(),
      gender: student.gender || "Male",
      status: student.status,
    });
    setIsAddModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudent({
          id: editingStudent.id,
          ...formData,
          year: parseInt(formData.year, 10),
          semester: parseInt(formData.semester, 10),
          admissionYear: parseInt(formData.admissionYear, 10),
        }).unwrap();
        showToast("Updated", "Student records updated successfully", "success");
      } else {
        await createStudent({
          ...formData,
          year: parseInt(formData.year, 10),
          semester: parseInt(formData.semester, 10),
          admissionYear: parseInt(formData.admissionYear, 10),
        }).unwrap();
        showToast("Created", "New student registered successfully", "success");
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to save student", "danger");
    }
  };

  const handleDelete = async () => {
    if (!deletingStudentId) return;
    try {
      await deleteStudent(deletingStudentId).unwrap();
      showToast("Removed", "Student profile deactivated and removed", "success");
      setDeletingStudentId(null);
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to delete student", "danger");
    }
  };

  const students = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Student Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enroll students, view academic profiles, manage sections, and inspect records.
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 self-start sm:self-auto">
          <UserPlus className="h-4 w-4" /> Add New Student
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by ID, name, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div>
            <Select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "ALL", label: "All Departments" },
                ...departments.map((d: any) => ({ value: d.id, label: d.code })),
              ]}
            />
          </div>

          <div>
            <Select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "ALL", label: "All Academic Years" },
                { value: "1", label: "Year 1" },
                { value: "2", label: "Year 2" },
                { value: "3", label: "Year 3" },
                { value: "4", label: "Year 4" },
              ]}
            />
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "ALL", label: "All Statuses" },
                { value: "ACTIVE", label: "Active" },
                { value: "SUSPENDED", label: "Suspended" },
                { value: "ALUMNI", label: "Alumni" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="overflow-hidden p-0">
        {isLoading || isFetching ? (
          <TableSkeleton rows={8} columns={6} />
        ) : students.length === 0 ? (
          <EmptyState
            title="No students found"
            description="Try adjusting your search criteria or add a new student."
            actionLabel="Register Student"
            onAction={handleOpenAdd}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name &amp; Email</TableHead>
                <TableHead>Department / Program</TableHead>
                <TableHead>Year &amp; Section</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any) => (
                <TableRow key={student.id}>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                    {student.studentId}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {student.user.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {student.user.firstName} {student.user.lastName}
                        </p>
                        <p className="text-xs text-slate-400">{student.user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {student.department?.code}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {student.program}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Year {student.year} (Sem {student.semester}, Sec {student.section})
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.status === "ACTIVE"
                          ? "success"
                          : student.status === "SUSPENDED"
                          ? "danger"
                          : "default"
                      }
                      size="sm"
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingStudent(student)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        title="View Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(student)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingStudentId(student.id)}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Student"
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

        {meta && (
          <div className="px-4">
            <Pagination
              currentPage={meta.page || 1}
              totalPages={meta.totalPages || 1}
              totalItems={meta.total}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </Card>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingStudent ? "Edit Student Record" : "Enroll New Student"}
        description="Fill out the profile and academic details below."
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student ID / Roll No"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              required
            />

            <Select
              label="Department"
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              options={departments.map((d: any) => ({ value: d.id, label: `${d.code} - ${d.name}` }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="University Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 555-0100"
            />
          </div>

          <Input
            label="Degree Program"
            value={formData.program}
            onChange={(e) => setFormData({ ...formData, program: e.target.value })}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Year"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              options={[
                { value: "1", label: "Year 1" },
                { value: "2", label: "Year 2" },
                { value: "3", label: "Year 3" },
                { value: "4", label: "Year 4" },
              ]}
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
            <Input
              label="Section"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Academic Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "SUSPENDED", label: "Suspended" },
                { value: "ALUMNI", label: "Alumni" },
              ]}
            />
            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isCreating || isUpdating}>
              {editingStudent ? "Save Changes" : "Create Student"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Details Inspection Modal */}
      <Modal
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        title="Student Academic Profile"
        description="Comprehensive profile, enrollment, and contact overview."
        maxWidth="md"
      >
        {viewingStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                {viewingStudent.user.firstName.charAt(0)}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {viewingStudent.user.firstName} {viewingStudent.user.lastName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {viewingStudent.studentId} · {viewingStudent.department?.name}
                </p>
                <Badge variant="success" size="sm" className="mt-1">
                  {viewingStudent.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Program</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {viewingStudent.program}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Cohort</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Year {viewingStudent.year}, Semester {viewingStudent.semester} (Sec {viewingStudent.section})
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {viewingStudent.user.email}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Cumulative CGPA</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {viewingStudent.cgpa?.toFixed(2) || "0.00"} / 10.0
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setViewingStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingStudentId}
        onClose={() => setDeletingStudentId(null)}
        onConfirm={handleDelete}
        title="Deactivate & Delete Student"
        description="Are you sure you want to delete this student record? All associated enrollments and grade logs will be deleted."
        confirmText="Yes, Delete Record"
        isLoading={isDeleting}
      />
    </div>
  );
}

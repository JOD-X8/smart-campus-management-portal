"use client";

import React, { useState } from "react";
import {
  useGetFacultyListQuery,
  useCreateFacultyMutation,
  useUpdateFacultyMutation,
  useDeleteFacultyMutation,
  useGetDepartmentsQuery,
} from "@/store/api/apiSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
  UserPlus,
  Search,
  Mail,
  Phone,
  BookOpen,
  Award,
  Edit2,
  Trash2,
  GraduationCap,
} from "lucide-react";

export default function FacultyDirectoryPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data, isLoading } = useGetFacultyListQuery({
    search,
    departmentId,
    status: statusFilter,
  });

  const { data: deptData } = useGetDepartmentsQuery(undefined);
  const departments = deptData?.data || [];

  const [createFaculty, { isLoading: isCreating }] = useCreateFacultyMutation();
  const [updateFaculty, { isLoading: isUpdating }] = useUpdateFacultyMutation();
  const [deleteFaculty, { isLoading: isDeleting }] = useDeleteFacultyMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any>(null);
  const [deletingFacultyId, setDeletingFacultyId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    facultyId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    departmentId: "",
    designation: "Assistant Professor",
    qualification: "Ph.D.",
    status: "ACTIVE",
  });

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setFormData({
      facultyId: `FAC-${departments[0]?.code || "CSE"}-${Math.floor(100 + Math.random() * 900)}`,
      firstName: "",
      lastName: "",
      email: "",
      password: "Faculty@123",
      phone: "",
      departmentId: departments[0]?.id || "",
      designation: "Assistant Professor",
      qualification: "Ph.D. in Engineering",
      status: "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fac: any) => {
    setEditingFaculty(fac);
    setFormData({
      facultyId: fac.facultyId,
      firstName: fac.user.firstName,
      lastName: fac.user.lastName,
      email: fac.user.email,
      password: "",
      phone: fac.phone || "",
      departmentId: fac.departmentId,
      designation: fac.designation,
      qualification: fac.qualification,
      status: fac.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await updateFaculty({
          id: editingFaculty.id,
          ...formData,
        }).unwrap();
        showToast("Updated", "Faculty details updated", "success");
      } else {
        await createFaculty(formData).unwrap();
        showToast("Created", "Faculty member added successfully", "success");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to save faculty", "danger");
    }
  };

  const handleDelete = async () => {
    if (!deletingFacultyId) return;
    try {
      await deleteFaculty(deletingFacultyId).unwrap();
      showToast("Removed", "Faculty member removed from directory", "success");
      setDeletingFacultyId(null);
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to delete faculty", "danger");
    }
  };

  const facultyList = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Faculty Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Department professors, research credentials, and assigned curricula.
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 self-start sm:self-auto">
          <UserPlus className="h-4 w-4" /> Add Faculty Member
        </Button>
      </div>

      {/* Filter bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            placeholder="Search by faculty ID, designation, or name..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "ON_LEAVE", label: "On Leave" },
              { value: "RETIRED", label: "Retired" },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : facultyList.length === 0 ? (
          <EmptyState
            title="No faculty members found"
            description="Adjust your search criteria or register a new faculty member."
            actionLabel="Add Faculty"
            onAction={handleOpenAdd}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Faculty ID</TableHead>
                <TableHead>Professor &amp; Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facultyList.map((fac: any) => (
                <TableRow key={fac.id}>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                    {fac.facultyId}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {fac.user.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {fac.user.firstName} {fac.user.lastName}
                        </p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          {fac.designation}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {fac.department?.code} - {fac.department?.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {fac.qualification}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={fac.status === "ACTIVE" ? "success" : "default"} size="sm">
                      {fac.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(fac)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingFacultyId(fac.id)}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Member"
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

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaculty ? "Edit Faculty Record" : "Add Faculty Member"}
        description="Provide academic designations and contact information."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Faculty ID"
              value={formData.facultyId}
              onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 555-0100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Designation"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g. Associate Professor"
              required
            />
            <Input
              label="Qualification"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="e.g. Ph.D. in Computer Science"
              required
            />
          </div>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "ON_LEAVE", label: "On Leave" },
              { value: "RETIRED", label: "Retired" },
            ]}
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
              {editingFaculty ? "Update Faculty" : "Add Faculty Member"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingFacultyId}
        onClose={() => setDeletingFacultyId(null)}
        onConfirm={handleDelete}
        title="Remove Faculty Member"
        description="Are you sure you want to remove this faculty member? Their assigned courses and schedules will need reassignment."
        confirmText="Yes, Remove Member"
        isLoading={isDeleting}
      />
    </div>
  );
}

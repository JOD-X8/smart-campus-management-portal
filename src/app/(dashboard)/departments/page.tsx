"use client";

import React, { useState } from "react";
import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "@/store/api/apiSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  Building2,
  PlusCircle,
  Users,
  UserCheck,
  BookOpen,
  Edit2,
  GraduationCap,
} from "lucide-react";

export default function DepartmentsPage() {
  const { showToast } = useToast();
  const { data, isLoading } = useGetDepartmentsQuery(undefined);
  const [createDept, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [updateDept, { isLoading: isUpdating }] = useUpdateDepartmentMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    hodName: "",
  });

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ code: "", name: "", description: "", hodName: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: any) => {
    setEditingDept(dept);
    setFormData({
      code: dept.code,
      name: dept.name,
      description: dept.description || "",
      hodName: dept.hodName || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await updateDept({ id: editingDept.id, ...formData }).unwrap();
        showToast("Updated", "Department information updated", "success");
      } else {
        await createDept(formData).unwrap();
        showToast("Created", "Department added successfully", "success");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to save department", "danger");
    }
  };

  const departments = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Department Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Academic departments, department heads, curriculum divisions, and resource allocations.
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 self-start sm:self-auto">
          <PlusCircle className="h-4 w-4" /> Add Department
        </Button>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept: any) => (
          <Card key={dept.id} className="p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-sm">
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-slate-400">Head: {dept.hodName || "Vacant"}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenEdit(dept)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>

              {dept.description && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {dept.description}
                </p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 text-center gap-2">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                  {dept._count?.students || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Students</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                  {dept._count?.faculty || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Faculty</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                  {dept._count?.courses || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Courses</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? "Edit Department" : "Add Department"}
        description="Configure department identifier, title, and Head of Department."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Department Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. AI-DS"
              required
            />
            <Input
              label="HOD Name"
              value={formData.hodName}
              onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
              placeholder="e.g. Dr. John von Neumann"
            />
          </div>

          <Input
            label="Department Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Artificial Intelligence & Data Science"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Academic division focus and laboratory specialties..."
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
              {editingDept ? "Save Changes" : "Create Department"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

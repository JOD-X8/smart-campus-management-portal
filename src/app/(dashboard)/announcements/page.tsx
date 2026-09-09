"use client";

import React, { useState } from "react";
import {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} from "@/store/api/apiSlice";
import { useAppSelector } from "@/store/hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
  Megaphone,
  PlusCircle,
  Calendar,
  AlertTriangle,
  User,
  Trash2,
} from "lucide-react";

export default function AnnouncementsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();
  const canPublish = user?.role === "ADMIN" || user?.role === "FACULTY";

  const [activeTab, setActiveTab] = useState("ALL");
  const { data, isLoading } = useGetAnnouncementsQuery({
    targetAudience: activeTab !== "ALL" ? activeTab : undefined,
  });

  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    targetAudience: "ALL",
    priority: "NORMAL",
  });

  const handleOpenAdd = () => {
    setForm({ title: "", content: "", targetAudience: "ALL", priority: "NORMAL" });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAnnouncement(form).unwrap();
      showToast("Published", "Campus announcement broadcasted", "success");
      setIsModalOpen(false);
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to post announcement", "danger");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteAnnouncement(deletingId).unwrap();
      showToast("Deleted", "Announcement removed", "success");
      setDeletingId(null);
    } catch {
      showToast("Error", "Failed to delete", "danger");
    }
  };

  const announcements = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Campus Announcements &amp; Bulletin
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official university notices, administrative circulars, and departmental memos.
          </p>
        </div>

        {canPublish && (
          <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 self-start sm:self-auto">
            <PlusCircle className="h-4 w-4" /> Post Announcement
          </Button>
        )}
      </div>

      <Tabs
        tabs={[
          { id: "ALL", label: "All Circulars" },
          { id: "STUDENT", label: "Students" },
          { id: "FACULTY", label: "Faculty" },
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab)}
      />

      {isLoading ? (
        <TableSkeleton rows={4} columns={3} />
      ) : announcements.length === 0 ? (
        <EmptyState
          title="No announcements found"
          description="There are currently no circulars published under this category."
          actionLabel={canPublish ? "Create Announcement" : undefined}
          onAction={canPublish ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.map((a: any) => (
            <Card key={a.id} className="p-6 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <Badge
                    variant={
                      a.priority === "URGENT"
                        ? "danger"
                        : a.priority === "HIGH"
                        ? "warning"
                        : "default"
                    }
                    size="sm"
                  >
                    {a.priority} NOTICE
                  </Badge>

                  {canPublish && (
                    <button
                      onClick={() => setDeletingId(a.id)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mt-2">
                  {a.title}
                </h3>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {a.content}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {a.author?.firstName} ({a.author?.role})
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Post Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast University Announcement"
        description="Provide title, body, audience group, and urgency level."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Annual Symposium Registration Open"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Target Audience"
              value={form.targetAudience}
              onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
              options={[
                { value: "ALL", label: "Entire Campus" },
                { value: "STUDENT", label: "Students" },
                { value: "FACULTY", label: "Faculty" },
              ]}
            />
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              options={[
                { value: "NORMAL", label: "Normal" },
                { value: "HIGH", label: "High Priority" },
                { value: "URGENT", label: "Urgent" },
              ]}
            />
          </div>

          <Textarea
            label="Notice Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={4}
            required
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
            <Button type="submit" size="sm" isLoading={isCreating}>
              Broadcast
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        description="Are you sure you want to remove this announcement?"
        isLoading={isDeleting}
      />
    </div>
  );
}

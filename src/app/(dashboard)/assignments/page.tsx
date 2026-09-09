"use client";

import React, { useState } from "react";
import {
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useSubmitAssignmentMutation,
  useGetCoursesQuery,
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
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
  FileText,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  BookOpen,
  Send,
} from "lucide-react";

export default function AssignmentsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();
  const isStudent = user?.role === "STUDENT";

  const [activeTab, setActiveTab] = useState("all");
  const { data, isLoading } = useGetAssignmentsQuery(undefined);
  const { data: coursesData } = useGetCoursesQuery(undefined);

  const assignments = data?.data || [];
  const courses = coursesData?.data || [];

  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();
  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation();

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState<any>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");

  const [assignmentForm, setAssignmentForm] = useState({
    courseId: "",
    title: "",
    description: "",
    dueDate: "",
    maxMarks: "50",
  });

  const handleOpenCreate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    setAssignmentForm({
      courseId: courses[0]?.id || "",
      title: "",
      description: "",
      dueDate: nextWeek.toISOString().split("T")[0],
      maxMarks: "50",
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAssignment({
        ...assignmentForm,
        facultyId: user?.id,
        maxMarks: parseFloat(assignmentForm.maxMarks),
      }).unwrap();
      showToast("Assignment Created", "Published to all enrolled students", "success");
      setIsCreateModalOpen(false);
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to create assignment", "danger");
    }
  };

  const handleOpenSubmit = (assignment: any) => {
    setSubmittingAssignment(assignment);
    setSubmissionContent("");
    setSubmissionUrl("");
  };

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    try {
      await submitAssignment({
        assignmentId: submittingAssignment.id,
        studentId: user?.studentId || user?.id,
        content: submissionContent,
        fileUrl: submissionUrl,
      }).unwrap();
      showToast("Submitted", "Your assignment submission was recorded", "success");
      setSubmittingAssignment(null);
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to submit assignment", "danger");
    }
  };

  // Filter assignments
  const now = new Date();
  const filteredAssignments = assignments.filter((a: any) => {
    const isSubmitted = a.submissions && a.submissions.length > 0;
    const isOverdue = new Date(a.dueDate) < now && !isSubmitted;

    if (activeTab === "upcoming") return !isSubmitted && !isOverdue;
    if (activeTab === "submitted") return isSubmitted;
    if (activeTab === "overdue") return isOverdue;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Course Assignments &amp; Projects
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish coursework requirements, submit solutions, and track deadlines.
          </p>
        </div>

        {!isStudent && (
          <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 self-start sm:self-auto">
            <PlusCircle className="h-4 w-4" /> Create Assignment
          </Button>
        )}
      </div>

      {/* Tabs Filter */}
      <Tabs
        tabs={[
          { id: "all", label: "All Assignments", count: assignments.length },
          { id: "upcoming", label: "Upcoming" },
          { id: "submitted", label: "Submitted" },
          { id: "overdue", label: "Overdue" },
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab)}
      />

      {/* Grid of Assignments */}
      {isLoading ? (
        <TableSkeleton rows={4} columns={3} />
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          title="No assignments found"
          description={
            isStudent
              ? "You're all caught up! No assignments found for this filter."
              : "Create an assignment to assign coursework to students."
          }
          actionLabel={!isStudent ? "Create Assignment" : undefined}
          onAction={!isStudent ? handleOpenCreate : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((a: any) => {
            const dueDate = new Date(a.dueDate);
            const isOverdue = dueDate < now;
            const hasSubmitted = a.submissions && a.submissions.length > 0;
            const submission = hasSubmitted ? a.submissions[0] : null;

            return (
              <Card key={a.id} className="p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {a.course?.code}
                    </span>
                    <Badge
                      variant={
                        hasSubmitted
                          ? "success"
                          : isOverdue
                          ? "danger"
                          : "primary"
                      }
                      size="sm"
                    >
                      {hasSubmitted ? "Submitted" : isOverdue ? "Overdue" : "Due Soon"}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mt-2 line-clamp-2">
                    {a.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {a.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Due: {dueDate.toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {a.maxMarks} Marks
                    </span>
                  </div>

                  {isStudent ? (
                    hasSubmitted ? (
                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between text-xs">
                        <span className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Solution Submitted
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant={isOverdue ? "danger" : "primary"}
                        onClick={() => handleOpenSubmit(a)}
                        className="w-full text-xs gap-1.5"
                      >
                        <Upload className="h-3.5 w-3.5" /> Submit Assignment
                      </Button>
                    )
                  ) : (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">
                        {a._count?.submissions || 0} Submissions
                      </span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        Prof. {a.faculty?.user?.lastName}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Course Assignment"
        description="Set description, deadline, and scoring rubrics."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Select
            label="Course"
            value={assignmentForm.courseId}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, courseId: e.target.value })}
            options={courses.map((c: any) => ({ value: c.id, label: `${c.code} - ${c.name}` }))}
            required
          />

          <Input
            label="Assignment Title"
            value={assignmentForm.title}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
            placeholder="e.g. Distributed Consensus Implementation"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={assignmentForm.dueDate}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
              required
            />
            <Input
              label="Maximum Marks"
              type="number"
              value={assignmentForm.maxMarks}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, maxMarks: e.target.value })}
              required
            />
          </div>

          <Textarea
            label="Description &amp; Instructions"
            value={assignmentForm.description}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
            placeholder="Detailed instructions, formatting criteria, and test requirements..."
            rows={4}
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isCreating}>
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Submit Modal */}
      <Modal
        isOpen={!!submittingAssignment}
        onClose={() => setSubmittingAssignment(null)}
        title={`Submit: ${submittingAssignment?.title}`}
        description="Provide your written solution or repository URL."
      >
        <form onSubmit={handleSubmitSolution} className="space-y-4">
          <Textarea
            label="Solution Text / Notes"
            value={submissionContent}
            onChange={(e) => setSubmissionContent(e.target.value)}
            placeholder="Paste your solution summary, implementation comments, or explanation..."
            rows={5}
          />

          <Input
            label="Project Repository / File URL"
            value={submissionUrl}
            onChange={(e) => setSubmissionUrl(e.target.value)}
            placeholder="https://github.com/username/project-repo"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSubmittingAssignment(null)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Turn In Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

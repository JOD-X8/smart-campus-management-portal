"use client";

import React, { useState } from "react";
import {
  useGetCoursesQuery,
  useGetAssessmentsQuery,
  useCreateAssessmentMutation,
  useSubmitGradesMutation,
  usePublishAssessmentMutation,
  useGetStudentAnalyticsQuery,
  useGetCourseByIdQuery,
} from "@/store/api/apiSlice";
import { useAppSelector } from "@/store/hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { calculateGrade } from "@/lib/utils";
import {
  Award,
  PlusCircle,
  CheckCircle,
  Eye,
  Send,
  BookOpen,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function GradesPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();
  const isStudent = user?.role === "STUDENT";

  // Faculty / Admin state
  const { data: coursesData } = useGetCoursesQuery(undefined);
  const courses = coursesData?.data || [];
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "");

  const { data: assessmentsData, isLoading: isAssessmentsLoading } = useGetAssessmentsQuery(
    { courseId: selectedCourseId },
    { skip: !selectedCourseId && !isStudent }
  );
  const assessments = assessmentsData?.data || [];

  const [createAssessment, { isLoading: isCreatingAssessment }] = useCreateAssessmentMutation();
  const [submitGrades, { isLoading: isSubmittingGrades }] = useSubmitGradesMutation();
  const [publishAssessment, { isLoading: isPublishing }] = usePublishAssessmentMutation();

  // Create assessment modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({
    title: "",
    type: "INTERNAL",
    maxMarks: "100",
    weightage: "20",
  });

  // Enter marks modal
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  const { data: singleCourseData } = useGetCourseByIdQuery(selectedCourseId, {
    skip: !selectedCourseId || isStudent,
  });
  const enrolledStudents = singleCourseData?.data?.enrollments?.map((e: any) => e.student) || [];

  // Student perspective data
  const { data: studentAnalyticsData, isLoading: isStudentLoading } = useGetStudentAnalyticsQuery(
    undefined,
    { skip: !isStudent }
  );
  const studentMetrics = studentAnalyticsData?.data;

  const handleOpenMarksEntry = (assessment: any) => {
    setActiveAssessment(assessment);
    const m: Record<string, number> = {};
    const f: Record<string, string> = {};

    assessment.grades?.forEach((g: any) => {
      m[g.studentId] = g.marksObtained;
    });

    enrolledStudents.forEach((s: any) => {
      if (m[s.id] === undefined) m[s.id] = 0;
    });

    setMarksMap(m);
    setFeedbackMap(f);
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessment) return;

    const gradesPayload = enrolledStudents.map((s: any) => ({
      studentId: s.id,
      marksObtained: Number(marksMap[s.id] || 0),
      feedback: feedbackMap[s.id] || "Evaluated by instructor",
    }));

    try {
      await submitGrades({
        assessmentId: activeAssessment.id,
        grades: gradesPayload,
      }).unwrap();
      showToast("Grades Saved", "Marks recorded successfully", "success");
      setActiveAssessment(null);
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to record grades", "danger");
    }
  };

  const handleTogglePublish = async (assessment: any) => {
    try {
      await publishAssessment({
        id: assessment.id,
        isPublished: !assessment.isPublished,
      }).unwrap();
      showToast(
        "Status Changed",
        assessment.isPublished ? "Assessment concealed from students" : "Grades published to students",
        "success"
      );
    } catch {
      showToast("Error", "Failed to update publish state", "danger");
    }
  };

  const handleCreateAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    try {
      await createAssessment({
        courseId: selectedCourseId,
        facultyId: singleCourseData?.data?.facultyId || user?.id,
        title: assessmentForm.title,
        type: assessmentForm.type,
        maxMarks: parseFloat(assessmentForm.maxMarks),
        weightage: parseFloat(assessmentForm.weightage),
      }).unwrap();
      showToast("Created", "Assessment created", "success");
      setIsCreateModalOpen(false);
      setAssessmentForm({ title: "", type: "INTERNAL", maxMarks: "100", weightage: "20" });
    } catch (err: any) {
      showToast("Error", err?.data?.error || "Failed to create assessment", "danger");
    }
  };

  // Student Report Card View
  if (isStudent) {
    if (isStudentLoading) return <TableSkeleton rows={6} columns={5} />;

    const recentGrades = studentMetrics?.recentGrades || [];
    const cgpa = studentMetrics?.student?.cgpa || 0;

    const chartData = recentGrades.map((g: any) => ({
      name: `${g.assessment.course.code}`,
      score: Math.round((g.marksObtained / g.assessment.maxMarks) * 100),
      max: 100,
    }));

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Academic Performance &amp; Grades
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official semester assessment results, continuous evaluation scores, and grade transcripts.
          </p>
        </div>

        {/* CGPA Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cumulative CGPA
            </span>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {cgpa.toFixed(2)}
              </span>
              <span className="text-sm text-slate-400 ml-1">/ 10.0</span>
            </div>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Evaluated Assessments
            </span>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {recentGrades.length}
              </span>
            </div>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Academic Standing
            </span>
            <div className="mt-2">
              <Badge variant="success" size="md" className="text-sm px-3 py-1">
                First Class with Distinction
              </Badge>
            </div>
          </Card>
        </div>

        {/* Grades Performance Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assessment Score Distribution (%)</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderRadius: "0.75rem",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="score" name="Percentage Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Grades Table */}
        <Card className="overflow-hidden p-0">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Published Assessment Report
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Assessment Title</TableHead>
                <TableHead>Marks Obtained</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade Letter</TableHead>
                <TableHead>Instructor Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentGrades.map((g: any) => {
                const gradeInfo = calculateGrade(g.marksObtained, g.assessment.maxMarks);
                return (
                  <TableRow key={g.id}>
                    <TableCell className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                      {g.assessment.course.code}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                      {g.assessment.title}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {g.marksObtained} / {g.assessment.maxMarks}
                    </TableCell>
                    <TableCell className="text-xs">{gradeInfo.percentage.toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          gradeInfo.grade.startsWith("A")
                            ? "success"
                            : gradeInfo.grade.startsWith("B")
                            ? "primary"
                            : "warning"
                        }
                        size="sm"
                      >
                        {gradeInfo.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {g.feedback || "Evaluated by course faculty"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  }

  // Faculty / Admin Assessment Management View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Assessment &amp; Marks Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create examinations, enter marks for enrolled students, and publish official grades.
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} size="sm" className="gap-1.5 self-start sm:self-auto">
          <PlusCircle className="h-4 w-4" /> Create Assessment
        </Button>
      </div>

      {/* Course Filter */}
      <Card className="p-4">
        <div className="max-w-md">
          <Select
            label="Filter Course"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            options={courses.map((c: any) => ({
              value: c.id,
              label: `${c.code} - ${c.name}`,
            }))}
          />
        </div>
      </Card>

      {/* Assessments List Table */}
      <Card className="overflow-hidden p-0">
        {isAssessmentsLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : assessments.length === 0 ? (
          <EmptyState
            title="No assessments created yet"
            description="Create an internal test, quiz, or midterm examination for this course."
            actionLabel="Create Assessment"
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Max Marks</TableHead>
                <TableHead>Weightage</TableHead>
                <TableHead>Publish Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((ass: any) => (
                <TableRow key={ass.id}>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                    {ass.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" size="sm">
                      {ass.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-semibold">{ass.maxMarks} marks</TableCell>
                  <TableCell className="text-xs">{ass.weightage}%</TableCell>
                  <TableCell>
                    <Badge variant={ass.isPublished ? "success" : "warning"} size="sm">
                      {ass.isPublished ? "Published" : "Draft / Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenMarksEntry(ass)}
                        className="text-xs gap-1 py-1 h-7"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Enter Marks
                      </Button>
                      <Button
                        variant={ass.isPublished ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => handleTogglePublish(ass)}
                        className="text-xs gap-1 py-1 h-7"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {ass.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create Assessment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Course Assessment"
        description="Set up test parameters and grading weightage."
      >
        <form onSubmit={handleCreateAssessmentSubmit} className="space-y-4">
          <Input
            label="Assessment Title"
            value={assessmentForm.title}
            onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
            placeholder="e.g. Midterm Examination"
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Type"
              value={assessmentForm.type}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, type: e.target.value })}
              options={[
                { value: "QUIZ", label: "Quiz" },
                { value: "INTERNAL", label: "Internal Test" },
                { value: "ASSIGNMENT", label: "Assignment" },
                { value: "MIDTERM", label: "Midterm Exam" },
                { value: "FINAL_EXAM", label: "Final Exam" },
              ]}
            />
            <Input
              label="Max Marks"
              type="number"
              value={assessmentForm.maxMarks}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, maxMarks: e.target.value })}
              required
            />
            <Input
              label="Weightage (%)"
              type="number"
              value={assessmentForm.weightage}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, weightage: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isCreatingAssessment}>
              Create Assessment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enter Marks Batch Modal */}
      <Modal
        isOpen={!!activeAssessment}
        onClose={() => setActiveAssessment(null)}
        title={`Enter Marks: ${activeAssessment?.title}`}
        description={`Input score out of ${activeAssessment?.maxMarks} for enrolled students.`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveMarks} className="space-y-4">
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl p-2">
            {enrolledStudents.map((s: any) => (
              <div key={s.id} className="p-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {s.user.firstName} {s.user.lastName}
                  </p>
                  <p className="text-[11px] text-slate-400">{s.studentId} · Sec {s.section}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={marksMap[s.id] ?? 0}
                    onChange={(e) =>
                      setMarksMap({ ...marksMap, [s.id]: parseFloat(e.target.value) || 0 })
                    }
                    min={0}
                    max={activeAssessment?.maxMarks || 100}
                    className="w-24 text-center text-sm font-semibold"
                    required
                  />
                  <span className="text-xs text-slate-400">/ {activeAssessment?.maxMarks}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveAssessment(null)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmittingGrades}>
              Save All Marks
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

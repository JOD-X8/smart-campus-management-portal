import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeRoles } from "@/lib/rbac";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["STUDENT", "ADMIN", "FACULTY"]);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const { message, studentId: requestedStudentId } = body;

    if (!message || typeof message !== "string") {
      return apiError("Message is required", 400);
    }

    // Identify target student
    let student;
    if (auth.user!.role === "STUDENT") {
      student = await prisma.student.findUnique({
        where: { userId: auth.user!.id },
        include: {
          user: true,
          department: true,
          enrollments: { include: { course: true } },
        },
      });
    } else if (requestedStudentId) {
      student = await prisma.student.findUnique({
        where: { id: requestedStudentId },
        include: {
          user: true,
          department: true,
          enrollments: { include: { course: true } },
        },
      });
    } else {
      student = await prisma.student.findFirst({
        include: {
          user: true,
          department: true,
          enrollments: { include: { course: true } },
        },
      });
    }

    if (!student) {
      return apiError("Student academic profile not found", 404);
    }

    // Gather authorized student academic data context
    const courseIds = student.enrollments.map((e) => e.courseId);

    // 1. Attendance
    const attendanceStats = await Promise.all(
      student.enrollments.map(async (enr) => {
        const total = await prisma.attendanceSession.count({ where: { courseId: enr.courseId } });
        const present = await prisma.attendanceRecord.count({
          where: { studentId: student.id, status: "PRESENT", session: { courseId: enr.courseId } },
        });
        const pct = total > 0 ? Math.round((present / total) * 100) : 100;
        return {
          course: enr.course.name,
          code: enr.course.code,
          total,
          present,
          percentage: pct,
          isRisk: pct < 75,
        };
      })
    );

    // 2. Upcoming assignments
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        courseId: { in: courseIds },
        dueDate: { gte: new Date() },
      },
      include: {
        course: true,
        submissions: { where: { studentId: student.id } },
      },
      orderBy: { dueDate: "asc" },
      take: 4,
    });

    // 3. Grades
    const grades = await prisma.grade.findMany({
      where: { studentId: student.id, assessment: { isPublished: true } },
      include: { assessment: { include: { course: true } } },
      orderBy: { gradedAt: "desc" },
    });

    const queryLower = message.toLowerCase();
    let reply = "";
    const suggestions: string[] = [];

    if (queryLower.includes("attendance")) {
      const risks = attendanceStats.filter((a) => a.isRisk);
      const overallPresent = attendanceStats.reduce((sum, a) => sum + a.present, 0);
      const overallTotal = attendanceStats.reduce((sum, a) => sum + a.total, 0);
      const overallPct = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 100;

      reply = `**Attendance Summary for ${student.user.firstName}:**\n\nYour overall attendance across all enrolled subjects is **${overallPct}%**.\n\n` +
        attendanceStats
          .map(
            (a) =>
              `• **${a.code}** (${a.course}): ${a.percentage}% (${a.present}/${a.total} classes)${
                a.isRisk ? " ⚠️ *Below 75% threshold!*" : " ✅ *Good standing*"
              }`
          )
          .join("\n");

      if (risks.length > 0) {
        reply += `\n\n> ⚠️ **Attendance Alert**: You are currently below the required 75% minimum in ${risks
          .map((r) => r.code)
          .join(", ")}. Be sure to attend the upcoming sessions to prevent academic sanctions.`;
      }
      suggestions.push("What assignments are due this week?", "Which subjects am I performing poorly in?");
    } else if (
      queryLower.includes("poor") ||
      queryLower.includes("weak") ||
      queryLower.includes("low") ||
      queryLower.includes("grade") ||
      queryLower.includes("marks")
    ) {
      if (grades.length === 0) {
        reply = `There are currently no published exam marks recorded for your courses.`;
      } else {
        const gradeList = grades.map((g) => ({
          course: g.assessment.course.code,
          title: g.assessment.title,
          score: g.marksObtained,
          max: g.assessment.maxMarks,
          pct: Math.round((g.marksObtained / g.assessment.maxMarks) * 100),
        }));

        const lowest = [...gradeList].sort((a, b) => a.pct - b.pct)[0];
        const highest = [...gradeList].sort((a, b) => b.pct - a.pct)[0];

        reply = `**Academic Performance Analysis:**\n\n` +
          `• **Top Performing Subject:** ${highest.course} (${highest.title}) with **${highest.pct}%** score (${highest.score}/${highest.max}).\n` +
          `• **Focus Subject Needed:** ${lowest.course} (${lowest.title}) at **${lowest.pct}%** score (${lowest.score}/${lowest.max}).\n\n` +
          `**All Evaluated Assessments:**\n` +
          gradeList.map((g) => `• ${g.course} · ${g.title}: **${g.score}/${g.max}** (${g.pct}%)`).join("\n");

        if (lowest.pct < 70) {
          reply += `\n\n💡 **Recommendation:** Consider reviewing lecture notes for ${lowest.course} and consulting with the faculty during office hours.`;
        }
      }
      suggestions.push("How is my attendance?", "How can I improve my performance?");
    } else if (
      queryLower.includes("assignment") ||
      queryLower.includes("due") ||
      queryLower.includes("homework")
    ) {
      if (upcomingAssignments.length === 0) {
        reply = `Good news! You have no pending assignments due this week. All caught up!`;
      } else {
        reply = `**Upcoming Assignments & Deadlines:**\n\n` +
          upcomingAssignments
            .map((a) => {
              const hasSubmitted = a.submissions.length > 0;
              const dueStr = new Date(a.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              return `• **${a.course.code}**: ${a.title}\n  Due: **${dueStr}** · Max Marks: ${a.maxMarks} · Status: ${
                hasSubmitted ? "✅ Submitted" : "⏳ Pending"
              }`;
            })
            .join("\n\n");
      }
      suggestions.push("Summarize my academic progress.", "How is my attendance?");
    } else if (queryLower.includes("improve") || queryLower.includes("tips") || queryLower.includes("advice")) {
      const lowAttendance = attendanceStats.filter((a) => a.isRisk);
      reply = `**Personalized Academic Improvement Strategy for ${student.user.firstName}:**\n\n` +
        `1. **Attendance Recovery:** ${
          lowAttendance.length > 0
            ? `Prioritize regular attendance in ${lowAttendance.map((l) => l.code).join(", ")} to bring your record above 75%.`
            : `Your attendance is in good standing across all subjects. Maintain this consistency!`
        }\n` +
        `2. **Assignment Submissions:** Ensure timely submission for all assignments to secure full continuous assessment marks.\n` +
        `3. **Active Office Hours:** Connect with course instructors during their designated advisory hours for clarification on complex topics.\n` +
        `4. **Peer Study Sessions:** Form focused study circles for algorithmic problem solving and database design practices.`;
      suggestions.push("What assignments are due this week?", "Summarize my academic progress.");
    } else {
      // General progress summary
      const overallPresent = attendanceStats.reduce((sum, a) => sum + a.present, 0);
      const overallTotal = attendanceStats.reduce((sum, a) => sum + a.total, 0);
      const overallPct = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 100;

      reply = `Hello ${student.user.firstName}! Here is your current academic overview:\n\n` +
        `• **Program:** ${student.program} (Semester ${student.semester}, Section ${student.section})\n` +
        `• **Current CGPA:** **${student.cgpa} / 10.0**\n` +
        `• **Overall Attendance:** **${overallPct}%** (${attendanceStats.filter((a) => a.isRisk).length} subjects need attention)\n` +
        `• **Upcoming Deadlines:** ${upcomingAssignments.length} active assignment(s)\n\n` +
        `How can I assist your studies today? You can ask about attendance, upcoming due dates, or performance tips!`;
      suggestions.push("How is my attendance?", "What assignments are due this week?", "Which subjects am I performing poorly in?");
    }

    return apiSuccess({
      reply,
      suggestions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Assistant API error:", error);
    return apiError("AI Academic Assistant encountered an issue", 500);
  }
}

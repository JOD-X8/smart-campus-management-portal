import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: [
    "Auth",
    "Students",
    "Faculty",
    "Courses",
    "Departments",
    "Attendance",
    "Grades",
    "Timetable",
    "Assignments",
    "Announcements",
    "Notifications",
    "Analytics",
    "AI",
  ],
  endpoints: (builder) => ({
    // Auth & Session
    getCurrentUser: builder.query({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),

    // Admin & General Analytics
    getAdminAnalytics: builder.query({
      query: () => "/analytics/admin",
      providesTags: ["Analytics"],
    }),
    getStudentAnalytics: builder.query({
      query: (studentId) => `/analytics/student?studentId=${studentId || ""}`,
      providesTags: ["Analytics", "Attendance", "Grades"],
    }),
    getFacultyAnalytics: builder.query({
      query: (facultyId) => `/analytics/faculty?facultyId=${facultyId || ""}`,
      providesTags: ["Analytics", "Attendance", "Assignments"],
    }),

    // Students
    getStudents: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params as Record<string, string>).toString();
        return `/students?${queryParams}`;
      },
      providesTags: ["Students"],
    }),
    getStudentById: builder.query({
      query: (id: string) => `/students/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Students", id }],
    }),
    createStudent: builder.mutation({
      query: (data) => ({
        url: "/students",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Students", "Analytics", "Departments"],
    }),
    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/students/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => ["Students", { type: "Students", id }, "Analytics"],
    }),
    deleteStudent: builder.mutation({
      query: (id: string) => ({
        url: `/students/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Students", "Analytics", "Departments"],
    }),

    // Faculty
    getFacultyList: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params as Record<string, string>).toString();
        return `/faculty?${queryParams}`;
      },
      providesTags: ["Faculty"],
    }),
    getFacultyById: builder.query({
      query: (id: string) => `/faculty/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Faculty", id }],
    }),
    createFaculty: builder.mutation({
      query: (data) => ({
        url: "/faculty",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Faculty", "Analytics", "Departments"],
    }),
    updateFaculty: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/faculty/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => ["Faculty", { type: "Faculty", id }],
    }),
    deleteFaculty: builder.mutation({
      query: (id: string) => ({
        url: `/faculty/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Faculty", "Analytics", "Departments"],
    }),

    // Courses
    getCourses: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params as Record<string, string>).toString();
        return `/courses?${queryParams}`;
      },
      providesTags: ["Courses"],
    }),
    getCourseById: builder.query({
      query: (id: string) => `/courses/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Courses", id }],
    }),
    createCourse: builder.mutation({
      query: (data) => ({
        url: "/courses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Courses", "Analytics"],
    }),
    updateCourse: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/courses/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => ["Courses", { type: "Courses", id }],
    }),
    deleteCourse: builder.mutation({
      query: (id: string) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses", "Analytics"],
    }),
    assignStudentsToCourse: builder.mutation({
      query: ({ courseId, studentIds }) => ({
        url: `/courses/${courseId}/enroll`,
        method: "POST",
        body: { studentIds },
      }),
      invalidatesTags: ["Courses", "Students"],
    }),

    // Departments
    getDepartments: builder.query({
      query: () => "/departments",
      providesTags: ["Departments"],
    }),
    createDepartment: builder.mutation({
      query: (data) => ({
        url: "/departments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Departments", "Analytics"],
    }),
    updateDepartment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/departments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Departments"],
    }),

    // Attendance
    getAttendanceSessions: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params as Record<string, string>).toString();
        return `/attendance?${queryParams}`;
      },
      providesTags: ["Attendance"],
    }),
    submitAttendance: builder.mutation({
      query: (data) => ({
        url: "/attendance",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance", "Analytics", "AI"],
    }),

    // Grades / Assessments
    getAssessments: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params as Record<string, string>).toString();
        return `/grades?${queryParams}`;
      },
      providesTags: ["Grades"],
    }),
    createAssessment: builder.mutation({
      query: (data) => ({
        url: "/grades",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Grades"],
    }),
    submitGrades: builder.mutation({
      query: (data) => ({
        url: "/grades/submit",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Grades", "Analytics", "AI"],
    }),
    publishAssessment: builder.mutation({
      query: ({ id, isPublished }) => ({
        url: `/grades/${id}/publish`,
        method: "PATCH",
        body: { isPublished },
      }),
      invalidatesTags: ["Grades", "Notifications", "Analytics"],
    }),

    // Timetable
    getTimetable: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params as Record<string, string>).toString();
        return `/timetable?${queryParams}`;
      },
      providesTags: ["Timetable"],
    }),
    createTimetableSlot: builder.mutation({
      query: (data) => ({
        url: "/timetable",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Timetable"],
    }),
    deleteTimetableSlot: builder.mutation({
      query: (id: string) => ({
        url: `/timetable/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Timetable"],
    }),

    // Assignments
    getAssignments: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params as Record<string, string>).toString();
        return `/assignments?${queryParams}`;
      },
      providesTags: ["Assignments"],
    }),
    createAssignment: builder.mutation({
      query: (data) => ({
        url: "/assignments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assignments", "Notifications"],
    }),
    submitAssignment: builder.mutation({
      query: ({ assignmentId, ...data }) => ({
        url: `/assignments/${assignmentId}/submit`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Assignments"],
    }),

    // Announcements
    getAnnouncements: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params as Record<string, string>).toString();
        return `/announcements?${queryParams}`;
      },
      providesTags: ["Announcements"],
    }),
    createAnnouncement: builder.mutation({
      query: (data) => ({
        url: "/announcements",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Announcements", "Notifications"],
    }),
    deleteAnnouncement: builder.mutation({
      query: (id: string) => ({
        url: `/announcements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Announcements"],
    }),

    // Notifications
    getNotifications: builder.query({
      query: () => "/notifications",
      providesTags: ["Notifications"],
    }),
    markNotificationRead: builder.mutation({
      query: (id: string) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllNotificationsRead: builder.mutation<any, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // Global Search
    globalSearch: builder.query({
      query: (q: string) => `/search?q=${encodeURIComponent(q)}`,
    }),

    // AI Academic Assistant & Insights
    askAiAssistant: builder.mutation({
      query: (data) => ({
        url: "/ai/assistant",
        method: "POST",
        body: data,
      }),
    }),
    getAiInsights: builder.query({
      query: (studentId) => `/ai/insights?studentId=${studentId || ""}`,
      providesTags: ["AI"],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useGetAdminAnalyticsQuery,
  useGetStudentAnalyticsQuery,
  useGetFacultyAnalyticsQuery,
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetFacultyListQuery,
  useGetFacultyByIdQuery,
  useCreateFacultyMutation,
  useUpdateFacultyMutation,
  useDeleteFacultyMutation,
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useAssignStudentsToCourseMutation,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useGetAttendanceSessionsQuery,
  useSubmitAttendanceMutation,
  useGetAssessmentsQuery,
  useCreateAssessmentMutation,
  useSubmitGradesMutation,
  usePublishAssessmentMutation,
  useGetTimetableQuery,
  useCreateTimetableSlotMutation,
  useDeleteTimetableSlotMutation,
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useSubmitAssignmentMutation,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useLazyGlobalSearchQuery,
  useAskAiAssistantMutation,
  useGetAiInsightsQuery,
} = apiSlice;

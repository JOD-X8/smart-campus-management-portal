# Smart Campus Management Portal

A centralized, production-grade **Smart Campus Management Portal & Academic ERP** designed for colleges and universities. Built with Next.js 14 App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM, Redux Toolkit + RTK Query, and an integrated AI Academic Advisor.

---

## Key Features

- **Role-Based Access Control (RBAC)**: Strict permission boundaries for `ADMIN`, `FACULTY`, and `STUDENT` on both the client and Edge middleware / API route handlers.
- **Modern SaaS Application Shell**: Responsive layout with collapsible sidebar, mobile drawer, theme switcher (Dark / Light mode), real-time notification popover, and debounced global search (`Ctrl + K`).
- **Administrative Telemetry Dashboard**:
  - Live university KPI cards (Total Students, Faculty, Courses, Departments, Average Turnout).
  - Recharts visualizations: Department student/faculty distributions and course enrollment bars.
  - Quick action modals for broadcasting notices and registering courses.
- **Student Academic Dashboard**:
  - Semester, program, and cumulative CGPA tracker.
  - Interactive attendance progress gauge with automated low-attendance warnings (< 75%).
  - Today's lecture schedule and upcoming assignment deadlines.
  - Official published assessment transcript.
- **Faculty Instructor Portal**:
  - Daily lecture schedule timeline with room numbers and cohorts.
  - Course rosters and rapid 1-click roll call attendance recording.
  - Assessment creation and marks entry with batch saving and student grade publication.
- **Student Management Module**: Full CRUD, search by Roll No/Name, filter by Department/Year/Status, pagination, and student profile inspection.
- **Faculty Management Module**: Full CRUD, designation tracking, and course allocations.
- **Course & Department Modules**: Academic catalog with credit weightage and batch student enrollment assignments.
- **Attendance Module**: Course attendance sessions with automatic warnings triggered when attendance falls below 75%.
- **Grades / Marks Module**: Support for Quizzes, Internals, Midterms, and Final Exams with percentage scoring, letter grades (A+, A, B+, B, C, F), and student feedback.
- **Timetable Planner**: Weekly grid matrix (Monday to Saturday) and "Today's Schedule" timeline view.
- **Coursework & Assignments**: Homework creation by faculty with deadline alerts, text/URL solution turn-in by students, and submission timestamps.
- **Announcements & Notifications**: Targeted broadcasts (All, Students, Faculty) with priority badges (Normal, High, Urgent) and automatic unread notification dispatching.
- **AI Academic Assistant & Performance Insights**:
  - Contextually grounded AI advisor providing instant answers to questions like *"How is my attendance?"*, *"What assignments are due this week?"*, *"Which subjects am I performing poorly in?"*, and *"How can I improve my performance?"*.
  - Strict privacy safeguards: Isolates student records and prevents unauthorized data leaks.

---

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **State & Data Caching**: Redux Toolkit + RTK Query (automated tag invalidation)
- **Validation**: React Hook Form + Zod
- **Backend**: Next.js Route Handlers (RESTful architecture)
- **Database & ORM**: PostgreSQL 18 + Prisma ORM
- **Authentication**: Bcryptjs (Salted 10-round hashing) + Jose (Edge-compatible signed JWT cookies)
- **Testing**: Node Test Runner (`node:test`)

---

## Project Structure

```
smart-campus-management-portal/
├── prisma/
│   ├── schema.prisma           # Relational schema with enums & indexes
│   └── seed.ts                 # Realistic development seed script
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/          # SaaS login page with one-click demo switchers
│   │   ├── (dashboard)/
│   │   │   ├── admin/          # Admin dashboard & Recharts
│   │   │   ├── faculty/        # Faculty teaching console
│   │   │   ├── student/        # Student academic dashboard
│   │   │   ├── students/       # Student CRUD & filters
│   │   │   ├── faculty-dir/    # Faculty directory
│   │   │   ├── courses/        # Course catalog & enrollment
│   │   │   ├── departments/    # Department metrics
│   │   │   ├── attendance/     # Roll call & turnout tracking
│   │   │   ├── grades/         # Assessments & report cards
│   │   │   ├── timetable/      # Weekly grid & daily timeline
│   │   │   ├── assignments/    # Homework & project turn-in
│   │   │   ├── announcements/  # Campus bulletins
│   │   │   ├── notifications/  # Notification center
│   │   │   ├── ai-assistant/   # AI Academic Advisor & Insights
│   │   │   └── settings/       # Profile, password, theme settings
│   │   ├── api/                # REST API route handlers
│   │   ├── globals.css         # Tailwind tokens & dark/light theme CSS variables
│   │   └── layout.tsx          # Root layout with Redux & Toast providers
│   ├── components/
│   │   ├── ui/                 # Design system (Button, Input, Modal, Table, etc.)
│   │   └── layout/             # Sidebar, Header, AppShell, SearchModal
│   ├── lib/
│   │   ├── prisma.ts           # Global Prisma client
│   │   ├── auth.ts             # JWT signing, verification, and cookies
│   │   ├── rbac.ts             # Server-side permission guards
│   │   ├── api-response.ts     # Standardized JSON response envelopes
│   │   └── utils.ts            # Grade, GPA, and attendance calculation engines
│   ├── store/
│   │   ├── index.ts            # Redux store
│   │   ├── slices/             # authSlice, uiSlice, notificationSlice
│   │   └── api/apiSlice.ts     # RTK Query API slice with tag invalidation
│   ├── schemas/                # Zod validation schemas
│   ├── types/                  # TypeScript domain interfaces
│   └── middleware.ts           # Route-level RBAC protection
├── tests/
│   └── portal.test.mjs         # Automated unit test suite
└── package.json
```

---

## Demo Accounts & Credentials

The database comes pre-seeded with realistic records. You can click the one-click demo buttons on the login screen (`/login`) or use:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campus.edu` | `Admin@123` | Full administrative control |
| **Faculty** | `alan.turing@campus.edu` | `Faculty@123` | Prof. Alan Turing (HOD, CS301) |
| **Faculty** | `grace.hopper@campus.edu` | `Faculty@123` | Prof. Grace Hopper (CS302) |
| **Student** | `alex.chen@campus.edu` | `Student@123` | High performing student (CGPA 9.20) |
| **Student** | `noah.johnson@campus.edu` | `Student@123` | Student with low attendance (< 75%) |

---

## Getting Started

### 1. Environment Configuration
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Ensure your PostgreSQL database connection string is specified:
```env
DATABASE_URL="postgresql://postgres@localhost:5433/smart_campus?schema=public"
JWT_SECRET="smart-campus-super-secret-key-prod-2024"
ATTENDANCE_WARNING_THRESHOLD=75
```

### 2. Database Sync & Seeding
Push the Prisma schema to create all relational tables:
```bash
npx prisma db push
```
Seed realistic academic records:
```bash
npx ts-node prisma/seed.ts
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Automated Testing

Run the automated calculation and authorization test suite:
```bash
npm test
```
All unit tests verify:
- Attendance percentage turnout calculations
- Low attendance risk threshold alerts (< 75%)
- Letter grade and grade point allocations (A+, A, B, C, F)
- Cumulative CGPA averaging
- Role-based authorization rules

---

## Deployment Instructions

1. **Database**: Provision a managed PostgreSQL instance (e.g. Supabase, Neon, AWS RDS, Railway).
2. **Environment Variables**: Configure `DATABASE_URL` and `JWT_SECRET` in your hosting dashboard (e.g. Vercel).
3. **Build**: Run `npm run build` to compile the production bundle.

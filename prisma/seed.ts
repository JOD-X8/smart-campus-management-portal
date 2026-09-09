import { PrismaClient, Role, AttendanceStatus, AssessmentType, DayOfWeek, SubmissionStatus, TargetAudience, Priority, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning existing database...");
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding departments...");
  const cseDept = await prisma.department.create({
    data: {
      code: "CSE",
      name: "Computer Science & Engineering",
      description: "Department of Computer Science and Information Technology",
      hodName: "Dr. Alan Turing",
    },
  });

  const eceDept = await prisma.department.create({
    data: {
      code: "ECE",
      name: "Electronics & Communication Engineering",
      description: "Department of VLSI, Embedded Systems, and Communications",
      hodName: "Dr. Claude Shannon",
    },
  });

  const mechDept = await prisma.department.create({
    data: {
      code: "MECH",
      name: "Mechanical Engineering",
      description: "Department of Robotics, Dynamics, and Thermal Sciences",
      hodName: "Dr. Nikola Tesla",
    },
  });

  const mathDept = await prisma.department.create({
    data: {
      code: "MATH",
      name: "Mathematics & Data Science",
      description: "Department of Advanced Calculus, Statistics, and AI Algorithms",
      hodName: "Dr. Katherine Johnson",
    },
  });

  const bizDept = await prisma.department.create({
    data: {
      code: "SOM",
      name: "School of Management",
      description: "Department of Business Analytics, Finance, and Operations",
      hodName: "Dr. Peter Drucker",
    },
  });

  console.log("Seeding Administrator account...");
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  await prisma.user.create({
    data: {
      email: "admin@campus.edu",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      firstName: "Campus",
      lastName: "Director",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log("Seeding Faculty accounts...");
  const facultyPasswordHash = await bcrypt.hash("Faculty@123", 10);
  const facultyData = [
    {
      email: "alan.turing@campus.edu",
      firstName: "Alan",
      lastName: "Turing",
      facultyId: "FAC-CSE-001",
      departmentId: cseDept.id,
      designation: "Professor & HOD",
      qualification: "Ph.D. in Computer Science (Cambridge)",
      phone: "+1 555-0101",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
      email: "grace.hopper@campus.edu",
      firstName: "Grace",
      lastName: "Hopper",
      facultyId: "FAC-CSE-002",
      departmentId: cseDept.id,
      designation: "Associate Professor",
      qualification: "Ph.D. in Mathematics & Compilers (Yale)",
      phone: "+1 555-0102",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
    {
      email: "claude.shannon@campus.edu",
      firstName: "Claude",
      lastName: "Shannon",
      facultyId: "FAC-ECE-001",
      departmentId: eceDept.id,
      designation: "Professor & HOD",
      qualification: "Ph.D. in Information Theory (MIT)",
      phone: "+1 555-0103",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
    {
      email: "katherine.johnson@campus.edu",
      firstName: "Katherine",
      lastName: "Johnson",
      facultyId: "FAC-MTH-001",
      departmentId: mathDept.id,
      designation: "Professor & HOD",
      qualification: "Ph.D. in Applied Mathematics",
      phone: "+1 555-0104",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
    {
      email: "richard.feynman@campus.edu",
      firstName: "Richard",
      lastName: "Feynman",
      facultyId: "FAC-MEC-001",
      departmentId: mechDept.id,
      designation: "Professor",
      qualification: "Ph.D. in Physics & Quantum Mechanics (Princeton)",
      phone: "+1 555-0105",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
  ];

  const createdFaculty = [];
  for (const fac of facultyData) {
    const user = await prisma.user.create({
      data: {
        email: fac.email,
        passwordHash: facultyPasswordHash,
        role: Role.FACULTY,
        firstName: fac.firstName,
        lastName: fac.lastName,
        avatarUrl: fac.avatar,
      },
    });

    const faculty = await prisma.faculty.create({
      data: {
        facultyId: fac.facultyId,
        userId: user.id,
        departmentId: fac.departmentId,
        designation: fac.designation,
        qualification: fac.qualification,
        phone: fac.phone,
        status: "ACTIVE",
      },
    });
    createdFaculty.push(faculty);
  }

  console.log("Seeding Courses...");
  const coursesData = [
    {
      code: "CS301",
      name: "Data Structures & Algorithms",
      description: "Master trees, graphs, sorting, dynamic programming, and complexity analysis.",
      credits: 4,
      departmentId: cseDept.id,
      semester: 3,
      academicYear: "2024-2025",
      facultyId: createdFaculty[0].id,
    },
    {
      code: "CS302",
      name: "Database Management Systems",
      description: "Relational modeling, SQL, normalization, concurrency control, and transactions.",
      credits: 4,
      departmentId: cseDept.id,
      semester: 3,
      academicYear: "2024-2025",
      facultyId: createdFaculty[1].id,
    },
    {
      code: "CS303",
      name: "Computer Networks & Security",
      description: "TCP/IP protocol suite, routing protocols, DNS, TLS cryptography, and firewalls.",
      credits: 3,
      departmentId: cseDept.id,
      semester: 3,
      academicYear: "2024-2025",
      facultyId: createdFaculty[0].id,
    },
    {
      code: "MA201",
      name: "Linear Algebra & Probability",
      description: "Matrix decompositions, Markov chains, random variables, and statistics for computing.",
      credits: 3,
      departmentId: mathDept.id,
      semester: 3,
      academicYear: "2024-2025",
      facultyId: createdFaculty[3].id,
    },
    {
      code: "EC204",
      name: "Digital Signal Processing",
      description: "Discrete Fourier transforms, filter design, and spectral analysis.",
      credits: 3,
      departmentId: eceDept.id,
      semester: 3,
      academicYear: "2024-2025",
      facultyId: createdFaculty[2].id,
    },
  ];

  const createdCourses = [];
  for (const c of coursesData) {
    const course = await prisma.course.create({ data: c });
    createdCourses.push(course);
  }

  console.log("Seeding Students (20+)...");
  const studentPasswordHash = await bcrypt.hash("Student@123", 10);
  const studentNames = [
    { first: "Alex", last: "Chen", gender: "Male", cgpa: 9.2, dept: cseDept.id, sem: 3 },
    { first: "Sophia", last: "Rodriguez", gender: "Female", cgpa: 8.8, dept: cseDept.id, sem: 3 },
    { first: "Liam", last: "Smith", gender: "Male", cgpa: 7.4, dept: cseDept.id, sem: 3 },
    { first: "Emma", last: "Watson", gender: "Female", cgpa: 9.5, dept: cseDept.id, sem: 3 },
    { first: "Noah", last: "Johnson", gender: "Male", cgpa: 6.8, dept: cseDept.id, sem: 3 }, // low attendance case
    { first: "Olivia", last: "Brown", gender: "Female", cgpa: 8.2, dept: cseDept.id, sem: 3 },
    { first: "Ethan", last: "Davis", gender: "Male", cgpa: 7.9, dept: cseDept.id, sem: 3 },
    { first: "Ava", last: "Miller", gender: "Female", cgpa: 9.0, dept: cseDept.id, sem: 3 },
    { first: "Lucas", last: "Wilson", gender: "Male", cgpa: 6.5, dept: cseDept.id, sem: 3 }, // low attendance case
    { first: "Mia", last: "Moore", gender: "Female", cgpa: 8.5, dept: cseDept.id, sem: 3 },
    { first: "Jackson", last: "Taylor", gender: "Male", cgpa: 7.2, dept: eceDept.id, sem: 3 },
    { first: "Aria", last: "Anderson", gender: "Female", cgpa: 8.9, dept: eceDept.id, sem: 3 },
    { first: "Mason", last: "Thomas", gender: "Male", cgpa: 8.1, dept: eceDept.id, sem: 3 },
    { first: "Isabella", last: "Jackson", gender: "Female", cgpa: 9.1, dept: mathDept.id, sem: 3 },
    { first: "Oliver", last: "White", gender: "Male", cgpa: 7.8, dept: mathDept.id, sem: 3 },
    { first: "Charlotte", last: "Harris", gender: "Female", cgpa: 8.7, dept: mechDept.id, sem: 3 },
    { first: "Elijah", last: "Martin", gender: "Male", cgpa: 7.5, dept: mechDept.id, sem: 3 },
    { first: "Harper", last: "Thompson", gender: "Female", cgpa: 8.4, dept: bizDept.id, sem: 3 },
    { first: "James", last: "Garcia", gender: "Male", cgpa: 8.0, dept: bizDept.id, sem: 3 },
    { first: "Amelia", last: "Martinez", gender: "Female", cgpa: 9.3, dept: cseDept.id, sem: 3 },
    { first: "Benjamin", last: "Robinson", gender: "Male", cgpa: 7.0, dept: cseDept.id, sem: 3 },
    { first: "Ella", last: "Clark", gender: "Female", cgpa: 8.6, dept: cseDept.id, sem: 3 },
  ];

  const createdStudents = [];
  for (let i = 0; i < studentNames.length; i++) {
    const s = studentNames[i];
    const padIndex = String(i + 1).padStart(3, "0");
    const studentId = `STU-2024-${padIndex}`;
    const email = `${s.first.toLowerCase()}.${s.last.toLowerCase()}@campus.edu`;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: studentPasswordHash,
        role: Role.STUDENT,
        firstName: s.first,
        lastName: s.last,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.first}`,
      },
    });

    const student = await prisma.student.create({
      data: {
        studentId,
        userId: user.id,
        departmentId: s.dept,
        program: "B.Tech Computer Science & Engineering",
        year: 2,
        semester: s.sem,
        section: i % 2 === 0 ? "A" : "B",
        admissionYear: 2023,
        dob: new Date(2004, (i % 12), (i % 25) + 1),
        gender: s.gender,
        phone: `+1 555-02${padIndex}`,
        status: "ACTIVE",
        cgpa: s.cgpa,
      },
    });

    createdStudents.push({ ...student, email, firstName: s.first, lastName: s.last });

    // Enroll in the first 4 courses if in CSE / MATH
    for (let c = 0; c < 4; c++) {
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: createdCourses[c].id,
          semester: 3,
          academicYear: "2024-2025",
          status: "ENROLLED",
        },
      });
    }
  }

  console.log("Seeding Attendance Sessions & Records...");
  const today = new Date();
  const dsaCourse = createdCourses[0]; // CS301
  const dbCourse = createdCourses[1]; // CS302

  // Create 15 attendance sessions across the semester for CS301
  for (let dayOffset = 15; dayOffset >= 1; dayOffset--) {
    const sessionDate = new Date(today);
    sessionDate.setDate(today.getDate() - dayOffset);

    const session = await prisma.attendanceSession.create({
      data: {
        courseId: dsaCourse.id,
        facultyId: createdFaculty[0].id,
        date: sessionDate,
        slot: "09:00 - 10:00",
        topic: `DSA Topic Lecture #${16 - dayOffset}: Trees & Graph Traversals`,
      },
    });

    // Mark attendance for enrolled students
    for (let sIdx = 0; sIdx < 12; sIdx++) {
      const student = createdStudents[sIdx];
      let status: AttendanceStatus = AttendanceStatus.PRESENT;

      // Student #4 (Noah) & Student #8 (Lucas) have lower attendance to test risk alerts
      if ((sIdx === 4 || sIdx === 8) && dayOffset % 2 === 1) {
        status = AttendanceStatus.ABSENT;
      } else if (dayOffset === 3 && sIdx === 2) {
        status = AttendanceStatus.ABSENT;
      }

      await prisma.attendanceRecord.create({
        data: {
          sessionId: session.id,
          studentId: student.id,
          status,
          remarks: status === AttendanceStatus.ABSENT ? "Unexcused Absence" : "Attended on time",
        },
      });
    }
  }

  // Create attendance sessions for Database Management (CS302)
  for (let dayOffset = 10; dayOffset >= 1; dayOffset--) {
    const sessionDate = new Date(today);
    sessionDate.setDate(today.getDate() - dayOffset * 2);

    const session = await prisma.attendanceSession.create({
      data: {
        courseId: dbCourse.id,
        facultyId: createdFaculty[1].id,
        date: sessionDate,
        slot: "11:00 - 12:00",
        topic: `DBMS Module ${11 - dayOffset}: SQL Joins & Normalization`,
      },
    });

    for (let sIdx = 0; sIdx < 12; sIdx++) {
      const student = createdStudents[sIdx];
      let status: AttendanceStatus = AttendanceStatus.PRESENT;
      if (sIdx === 4 && dayOffset <= 4) {
        status = AttendanceStatus.ABSENT; // Noah is low attendance in DBMS
      }
      await prisma.attendanceRecord.create({
        data: {
          sessionId: session.id,
          studentId: student.id,
          status,
          remarks: "Verified by Faculty",
        },
      });
    }
  }

  console.log("Seeding Assessments & Grades...");
  // Assessment 1: DSA Quiz 1
  const dsaQuiz = await prisma.assessment.create({
    data: {
      courseId: dsaCourse.id,
      facultyId: createdFaculty[0].id,
      title: "Quiz 1: Array, Stack & Queue Complexity",
      type: AssessmentType.QUIZ,
      maxMarks: 25,
      weightage: 10,
      isPublished: true,
      date: new Date(today.getTime() - 14 * 24 * 3600 * 1000),
    },
  });

  // Assessment 2: DSA Midterm
  const dsaMidterm = await prisma.assessment.create({
    data: {
      courseId: dsaCourse.id,
      facultyId: createdFaculty[0].id,
      title: "Midterm Examination: Trees, Heaps & Hashing",
      type: AssessmentType.MIDTERM,
      maxMarks: 100,
      weightage: 30,
      isPublished: true,
      date: new Date(today.getTime() - 5 * 24 * 3600 * 1000),
    },
  });

  // Assessment 3: DBMS Internal Test
  const dbInternal = await prisma.assessment.create({
    data: {
      courseId: dbCourse.id,
      facultyId: createdFaculty[1].id,
      title: "Internal Assessment 1: ER Modeling & Relational Algebra",
      type: AssessmentType.INTERNAL,
      maxMarks: 50,
      weightage: 20,
      isPublished: true,
      date: new Date(today.getTime() - 7 * 24 * 3600 * 1000),
    },
  });

  // Add marks for enrolled students
  for (let sIdx = 0; sIdx < 12; sIdx++) {
    const student = createdStudents[sIdx];
    const quizScore = 20 + ((sIdx * 3) % 6);
    const midtermScore = 65 + ((sIdx * 7) % 35);
    const dbScore = 35 + ((sIdx * 4) % 15);

    await prisma.grade.create({
      data: {
        assessmentId: dsaQuiz.id,
        studentId: student.id,
        marksObtained: quizScore,
        feedback: quizScore > 22 ? "Excellent command of asymptotic notation." : "Good effort. Review amortized bounds.",
      },
    });

    await prisma.grade.create({
      data: {
        assessmentId: dsaMidterm.id,
        studentId: student.id,
        marksObtained: midtermScore,
        feedback: midtermScore >= 80 ? "Outstanding tree traversal proofs." : "Revise B-Tree balancing steps.",
      },
    });

    await prisma.grade.create({
      data: {
        assessmentId: dbInternal.id,
        studentId: student.id,
        marksObtained: dbScore,
        feedback: "Strong relational schema designs.",
      },
    });
  }

  console.log("Seeding Timetable...");
  const timetableSlots = [
    { day: DayOfWeek.MONDAY, start: "09:00", end: "10:00", room: "Hall 301", course: dsaCourse.id, fac: createdFaculty[0].id },
    { day: DayOfWeek.MONDAY, start: "10:15", end: "11:15", room: "Lab 2", course: dbCourse.id, fac: createdFaculty[1].id },
    { day: DayOfWeek.MONDAY, start: "11:30", end: "12:30", room: "Hall 305", course: createdCourses[2].id, fac: createdFaculty[0].id },
    { day: DayOfWeek.TUESDAY, start: "09:00", end: "10:00", room: "Hall 204", course: createdCourses[3].id, fac: createdFaculty[3].id },
    { day: DayOfWeek.TUESDAY, start: "10:15", end: "11:15", room: "Hall 301", course: dsaCourse.id, fac: createdFaculty[0].id },
    { day: DayOfWeek.WEDNESDAY, start: "09:00", end: "10:00", room: "Lab 2", course: dbCourse.id, fac: createdFaculty[1].id },
    { day: DayOfWeek.WEDNESDAY, start: "14:00", end: "16:00", room: "CS Lab 1", course: dsaCourse.id, fac: createdFaculty[0].id },
    { day: DayOfWeek.THURSDAY, start: "09:00", end: "10:00", room: "Hall 301", course: dsaCourse.id, fac: createdFaculty[0].id },
    { day: DayOfWeek.THURSDAY, start: "11:30", end: "12:30", room: "Hall 305", course: createdCourses[2].id, fac: createdFaculty[0].id },
    { day: DayOfWeek.FRIDAY, start: "10:15", end: "11:15", room: "Lab 2", course: dbCourse.id, fac: createdFaculty[1].id },
    { day: DayOfWeek.FRIDAY, start: "14:00", end: "15:00", room: "Hall 204", course: createdCourses[3].id, fac: createdFaculty[3].id },
    { day: DayOfWeek.SATURDAY, start: "10:00", end: "12:00", room: "Seminar Hall", course: dsaCourse.id, fac: createdFaculty[0].id },
  ];

  for (const slot of timetableSlots) {
    await prisma.timetableSlot.create({
      data: {
        departmentId: cseDept.id,
        courseId: slot.course,
        facultyId: slot.fac,
        dayOfWeek: slot.day,
        startTime: slot.start,
        endTime: slot.end,
        room: slot.room,
        semester: 3,
        section: "A",
      },
    });
  }

  console.log("Seeding Assignments & Submissions...");
  const assign1 = await prisma.assignment.create({
    data: {
      courseId: dsaCourse.id,
      facultyId: createdFaculty[0].id,
      title: "Assignment 1: Balanced Binary Search Trees Implementation",
      description: "Implement AVL and Red-Black trees with insert, delete, and balancing rotations in C++ or Java with runtime tests.",
      dueDate: new Date(today.getTime() + 5 * 24 * 3600 * 1000), // Due in 5 days
      maxMarks: 50,
    },
  });

  const assign2 = await prisma.assignment.create({
    data: {
      courseId: dbCourse.id,
      facultyId: createdFaculty[1].id,
      title: "Assignment 2: Campus Portal Relational Schema & 3NF Normalization",
      description: "Submit schema design, functional dependencies, and proof of Boyce-Codd Normal Form for the university portal database.",
      dueDate: new Date(today.getTime() + 9 * 24 * 3600 * 1000), // Due in 9 days
      maxMarks: 40,
    },
  });

  // Seed sample submissions for student #1 (Alex Chen)
  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assign1.id,
      studentId: createdStudents[0].id,
      content: "Completed AVL Tree rotation implementations along with unit test suite covering 10,000 random insertions.",
      status: SubmissionStatus.SUBMITTED,
    },
  });

  console.log("Seeding Announcements...");
  const adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (adminUser) {
    await prisma.announcement.create({
      data: {
        title: "Fall 2024 Midterm Exam Schedule Released",
        content: "The official examination timetable for all undergraduate and postgraduate engineering courses is now published on the portal. Please verify your registered course slots.",
        authorId: adminUser.id,
        targetAudience: TargetAudience.ALL,
        priority: Priority.HIGH,
      },
    });

    await prisma.announcement.create({
      data: {
        title: "Annual Hackathon 'HackCampus 2024' Registration Open",
        content: "Join the 36-hour hackathon with cash prizes up to $10,000. Form teams of up to 4 members. Registrations close this Friday at 11:59 PM.",
        authorId: adminUser.id,
        targetAudience: TargetAudience.STUDENT,
        priority: Priority.NORMAL,
      },
    });

    await prisma.announcement.create({
      data: {
        title: "Faculty Senate Meeting & Curriculum Review",
        content: "All department heads and senior faculty members are requested to attend the curriculum symposium this Thursday in Senate Hall A.",
        authorId: adminUser.id,
        targetAudience: TargetAudience.FACULTY,
        priority: Priority.URGENT,
      },
    });
  }

  console.log("Seeding Notifications...");
  // Notifications for student Alex Chen
  const alexUser = await prisma.user.findUnique({ where: { email: "alex.chen@campus.edu" } });
  if (alexUser) {
    await prisma.notification.create({
      data: {
        userId: alexUser.id,
        title: "New Assignment Posted: AVL Trees",
        message: "Prof. Alan Turing posted a new assignment in CS301 due in 5 days.",
        type: NotificationType.INFO,
        link: "/assignments",
      },
    });
    await prisma.notification.create({
      data: {
        userId: alexUser.id,
        title: "Midterm Grade Published",
        message: "Your score for CS301 Midterm Examination is available. You scored 92/100 (Grade A+).",
        type: NotificationType.SUCCESS,
        link: "/grades",
      },
    });
  }

  // Attendance warning for Noah Johnson
  const noahUser = await prisma.user.findUnique({ where: { email: "noah.johnson@campus.edu" } });
  if (noahUser) {
    await prisma.notification.create({
      data: {
        userId: noahUser.id,
        title: "Attendance Warning: CS301 & CS302",
        message: "Your current attendance in Database Management Systems is 60%, which is below the mandatory 75% threshold.",
        type: NotificationType.WARNING,
        link: "/attendance",
      },
    });
  }

  console.log("--- SEEDING COMPLETED SUCCESSFULLY ---");
  console.log("Demo Credentials:");
  console.log("Admin:    admin@campus.edu / Admin@123");
  console.log("Faculty:  alan.turing@campus.edu / Faculty@123");
  console.log("Student:  alex.chen@campus.edu / Student@123");
  console.log("Student (Low Attendance): noah.johnson@campus.edu / Student@123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

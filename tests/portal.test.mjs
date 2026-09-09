import test from "node:test";
import assert from "node:assert";

// 1. Attendance percentage calculation tests
function calculateAttendancePercentage(present, total) {
  if (!total || total <= 0) return 100;
  const percentage = (present / total) * 100;
  return Math.round(percentage * 10) / 10;
}

function getAttendanceStatusColor(percentage) {
  if (percentage >= 85) {
    return { badge: "success", isRisk: false };
  }
  if (percentage >= 75) {
    return { badge: "warning", isRisk: false };
  }
  return { badge: "danger", isRisk: true };
}

test("calculateAttendancePercentage correctly computes turnout", () => {
  assert.strictEqual(calculateAttendancePercentage(10, 10), 100);
  assert.strictEqual(calculateAttendancePercentage(15, 20), 75);
  assert.strictEqual(calculateAttendancePercentage(12, 20), 60);
  assert.strictEqual(calculateAttendancePercentage(0, 0), 100);
});

test("getAttendanceStatusColor flags low attendance risk below 75%", () => {
  const good = getAttendanceStatusColor(92);
  assert.strictEqual(good.isRisk, false);
  assert.strictEqual(good.badge, "success");

  const border = getAttendanceStatusColor(78);
  assert.strictEqual(border.isRisk, false);
  assert.strictEqual(border.badge, "warning");

  const risk = getAttendanceStatusColor(68);
  assert.strictEqual(risk.isRisk, true);
  assert.strictEqual(risk.badge, "danger");
});

// 2. Grade and GPA calculation tests
function calculateGrade(marks, maxMarks = 100) {
  const percentage = maxMarks > 0 ? (marks / maxMarks) * 100 : 0;
  if (percentage >= 90) return { percentage, grade: "A+", point: 10.0, status: "PASS" };
  if (percentage >= 80) return { percentage, grade: "A", point: 9.0, status: "PASS" };
  if (percentage >= 70) return { percentage, grade: "B+", point: 8.0, status: "PASS" };
  if (percentage >= 60) return { percentage, grade: "B", point: 7.0, status: "PASS" };
  if (percentage >= 50) return { percentage, grade: "C", point: 6.0, status: "PASS" };
  if (percentage >= 40) return { percentage, grade: "D", point: 5.0, status: "PASS" };
  return { percentage, grade: "F", point: 0.0, status: "FAIL" };
}

function calculateCGPA(gradePoints) {
  if (!gradePoints.length) return 0.0;
  const sum = gradePoints.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / gradePoints.length) * 100) / 100;
}

test("calculateGrade returns proper letter grades and grade points", () => {
  assert.strictEqual(calculateGrade(95, 100).grade, "A+");
  assert.strictEqual(calculateGrade(95, 100).point, 10.0);
  assert.strictEqual(calculateGrade(82, 100).grade, "A");
  assert.strictEqual(calculateGrade(74, 100).grade, "B+");
  assert.strictEqual(calculateGrade(61, 100).grade, "B");
  assert.strictEqual(calculateGrade(52, 100).grade, "C");
  assert.strictEqual(calculateGrade(35, 100).grade, "F");
  assert.strictEqual(calculateGrade(35, 100).status, "FAIL");
});

test("calculateCGPA averages semester grade points correctly", () => {
  assert.strictEqual(calculateCGPA([9.0, 8.0, 10.0]), 9.0);
  assert.strictEqual(calculateCGPA([7.0, 8.0]), 7.5);
  assert.strictEqual(calculateCGPA([]), 0.0);
});

// 3. RBAC checks
function isAuthorizedRole(userRole, allowedRoles) {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

test("isAuthorizedRole grants and restricts access appropriately", () => {
  assert.strictEqual(isAuthorizedRole("ADMIN", ["ADMIN"]), true);
  assert.strictEqual(isAuthorizedRole("FACULTY", ["ADMIN", "FACULTY"]), true);
  assert.strictEqual(isAuthorizedRole("STUDENT", ["ADMIN", "FACULTY"]), false);
  assert.strictEqual(isAuthorizedRole("STUDENT", ["STUDENT", "FACULTY", "ADMIN"]), true);
  assert.strictEqual(isAuthorizedRole(undefined, ["ADMIN"]), false);
});

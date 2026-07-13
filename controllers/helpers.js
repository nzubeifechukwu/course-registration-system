const prisma = require("../lib/prisma");

// Helper function to reload admin dashboard if something fails
// Used in createCourse and deleteCourse controller functions
async function renderAdminDashboardWithError(
  req,
  res,
  validationErrorsArray,
  customErrorString,
) {
  const courses = await prisma.course.findMany({
    orderBy: [{ level: "asc" }, { title: "asc" }],
  });
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      level: true,
      registrations: { select: { course: { select: { title: true } } } },
    },
    orderBy: [{ level: "asc" }, { name: "asc" }],
  });

  return res.status(400).render("admin", {
    user: req.user,
    courses,
    students,
    errors: validationErrorsArray,
    oldData: req.body,
    error: customErrorString,
  });
}

// Helper function to reload student dashboard if something fails
// Used in registerCourse and dropCourse controller functions
async function renderStudentDashboardWithError(
  req,
  res,
  validationErrors,
  customErrorString,
) {
  const availableCourses = await prisma.course.findMany({
    where: { level: req.user.level },
    orderBy: { title: "asc" },
  });

  const studentRegistrations = await prisma.registration.findMany({
    where: { userId: req.user.id },
    select: { courseId: true },
  });

  const enrolledCourseIds = new Set(
    studentRegistrations.map((reg) => reg.courseId),
  );
  const coursesWithRegStatus = availableCourses.map((course) => ({
    ...course,
    isEnrolled: enrolledCourseIds.has(course.id),
  }));

  return res.status(400).render("student", {
    user: req.user,
    courses: coursesWithRegStatus,
    errors: validationErrors,
    error: customErrorString,
  });
}

module.exports = {
  renderAdminDashboardWithError,
  renderStudentDashboardWithError,
};

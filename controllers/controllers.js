const bcrypt = require("bcryptjs");
const passport = require("passport");

const prisma = require("../lib/prisma");

function home(req, res) {
  res.redirect("/login");
}

function getLogin(req, res) {
  // If user is already signed in, redirect them to their dashboard
  if (req.isAuthenticated()) {
    return req.user.role === "ADMIN"
      ? res.redirect("/admin")
      : res.redirect("/student");
  }
  return res.render("login", { error: null, errors: null, oldData: undefined });
}

function postLogin(req, res, next) {
  if (req.validationErrors) {
    return res.status(400).render("login", {
      errors: req.validationErrors,
      olData: req.oldData,
      error: null,
    });
  }

  // Passport authentication only if validation passes
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.render("login", {
        error: info.message || "Incorrect email and/or password.",
        errors: null, // Clear validate array errors
        oldData: req.body, // Retain the email address already typed
      });
    }

    req.logIn(user, (loginError) => {
      if (loginError) return next(loginError);

      if (user.role === "ADMIN") return res.redirect("/admin");
      return res.redirect("/student");
    });
  })(req, res, next);
}

function logout(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((destroyError) => {
      if (destroyError) return next(destroyError);

      res.clearCookie("connect.sid");

      return res.redirect("/login");
    });
  });
}

function getRegister(req, res) {
  // If user already exists, send them to their dashboard
  if (req.isAuthenticated()) {
    return req.user.role === "ADMIN"
      ? res.redirect("/admin")
      : res.redirect("/student");
  }
  return res.render("register", {
    error: null,
    errors: null,
    oldData: undefined,
  });
}

async function postRegister(req, res, next) {
  try {
    if (req.validationErrors) {
      return res.status(400).render("register", {
        errors: req.validationErrors,
        oldData: req.oldData,
        error: null,
      });
    }

    const { name, email, password, level } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.render("register", {
        error: "You have an account already. Click on 'Log in here' to log in.",
        errors: null,
        olData: req.body,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Using the default role of STUDENT since admins are often seeded manually
    await prisma.user.create({
      data: { name, email, password: hashedPassword, level },
    });

    return res.redirect("/login");
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).render("register", {
        error: "This email address has already been registered.",
        errors: null,
        oldData: req.body,
      });
    }
    next(error);
  }
}

async function getAdminDashboard(req, res, next) {
  try {
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

    return res.render("admin", {
      user: req.user,
      courses,
      students,
      errors: null,
      error: null,
      oldData: undefined,
    });
  } catch (error) {
    next(error);
  }
}

async function createCourse(req, res, next) {
  // Helper function to reload dashboard if something fails
  async function renderDashboardWithError(
    validationErrorsArray,
    singleErrorString,
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
      error: singleErrorString,
    });
  }

  try {
    // First check if the validator attached any errors to the request
    if (req.validationErrors) {
      // Retain your dashboard data if there are any validation errors
      return await renderDashboardWithError(req.validationErrors, null);
    }

    // Main business logic only runs if there are no validation errors
    const { title, level } = req.body;

    await prisma.course.create({ data: { title, level } });

    return res.redirect("/admin"); // refresh page to reflect the changes
  } catch (error) {
    // Prevent duplicate course creation
    if (error.code === "P2002") {
      return await renderDashboardWithError(
        null,
        "You have already added that course.",
      );
    }
    next(error);
  }
}

async function getStudentDashboard(req, res, next) {
  try {
    const availableCourses = await prisma.course.findMany({
      where: { level: req.user.level },
      orderBy: { title: "asc" },
    });

    const studentRegistrations = await prisma.registration.findMany({
      where: { userId: req.user.id },
      select: { courseId: true },
    });

    // Transform studentRegistrations to a set for faster lookups using Set.has() method
    const enrolledCourseIds = new Set(
      studentRegistrations.map((reg) => reg.courseId),
    );

    const coursesWithRegStatus = availableCourses.map((course) => ({
      ...course,
      isEnrolled: enrolledCourseIds.has(course.id),
    }));

    return res.render("student", {
      user: req.user,
      courses: coursesWithRegStatus,
      errors: null,
      error: null,
    });
  } catch (error) {
    next(error);
  }
}

// Helper function to reload the student dashboard state on errors
// Used in registerCourse and dropCourse functions
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

async function registerCourse(req, res, next) {
  try {
    if (req.validationErrors) {
      return await renderStudentDashboardWithError(
        req,
        res,
        req.validationErrors,
        null,
      );
    }

    const { courseId } = req.body;

    const targetCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!targetCourse) {
      return await renderStudentDashboardWithError(
        req,
        res,
        null,
        "The course you are attempting to register for does not exist.",
      );
    }

    if (targetCourse.level !== req.user.level) {
      return await renderStudentDashboardWithError(
        req,
        res,
        null,
        "You cannot register for courses outside of your academic level.",
      );
    }

    await prisma.registration.create({
      data: {
        user: { connect: { id: req.user.id } },
        course: { connect: { id: courseId } },
      },
    });

    return res.redirect("/student");
  } catch (error) {
    if (error.code === "P2002") {
      return await renderStudentDashboardWithError(
        req,
        res,
        null,
        "You are already registered for this course.",
      );
    }
    next(error);
  }
}

async function dropCourse(req, res, next) {
  try {
    if (req.validationErrors) {
      return await renderStudentDashboardWithError(
        req,
        res,
        req.validationErrors,
        null,
      );
    }

    const { courseId } = req.body;
    const userId = req.user.id;

    await prisma.registration.delete({
      where: { userId_courseId: { userId, courseId } },
    });

    return res.redirect("/student");
  } catch (error) {
    if (error.code === "P2025") {
      return await renderStudentDashboardWithError(
        req,
        res,
        null,
        "You are not enrolled in this course.",
      );
    }
    next(error);
  }
}

module.exports = {
  home,
  getLogin,
  postLogin,
  logout,
  getRegister,
  postRegister,
  getAdminDashboard,
  createCourse,
  getStudentDashboard,
  registerCourse,
  dropCourse,
};

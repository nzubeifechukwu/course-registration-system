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
  return res.render("login", { error: null });
}

function postLogin(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.render("login", {
        error: info.message || "Incorrect email and/or password.",
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
  return res.render("register", { error: null });
}

async function postRegister(req, res, next) {
  const { name, email, password, level } = req.body;

  try {
    if (!name || !email || !password || !level) {
      return res.render("register", { error: "All fields are required." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.render("register", {
        error: "You have an account already. Click on 'Log in here' to log in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Using the default role of STUDENT since admins are often seeded manually
    await prisma.user.create({
      data: { name, email, password: hashedPassword, level: parseInt(level) },
    });

    return res.redirect("/login");
  } catch (error) {
    if (error.code === "P2002") {
      return res.render("register", {
        error: "This email address has already been registered.",
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

    return res.render("admin", { user: req.user, courses, students });
  } catch (error) {
    next(error);
  }
}

async function createCourse(req, res, next) {
  try {
    const { title, level } = req.body;

    if (!title || !level) {
      return res.status(400).render("error", {
        title: "Bad Request",
        message: "Course title and level must be filled out.",
      });
    }

    await prisma.course.create({ data: { title, level: parseInt(level) } });

    return res.redirect("/admin"); // refresh page to reflect the changes
  } catch (error) {
    // Prevent duplicate course creation
    if (error.code === "P2002") {
      return res.status(409).render("error", {
        title: "Conflict",
        message: "A course with that title already exists.",
      });
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
    });
  } catch (error) {
    next(error);
  }
}

async function registerCourse(req, res, next) {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).render("error", {
        title: "Bad Request",
        message: "Missing course identification details.",
      });
    }

    const targetCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!targetCourse) {
      return res.status(404).render("error", {
        title: "Not Found",
        message:
          "The course you are attempting to register for does not exist.",
      });
    }

    if (targetCourse.level !== req.user.level) {
      return res.status(403).render("error", {
        title: "Forbidden",
        message:
          "You cannot register for courses outside of your academic level.",
      });
    }

    await prisma.registration.create({
      data: {
        user: { connect: { id: req.user.id } },
        course: { connect: { id: courseId } },
      },
    });

    return res.redirect("/student");
  } catch (error) {
    // Prevent double registration
    if (error.code === "P2002") {
      return res.status(409).render("error", {
        title: "Conflict",
        message: "You are already registered for this course.",
      });
    }
    next(error);
  }
}

async function dropCourse(req, res, next) {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).render("error", {
        title: "Bad Request",
        message: "Missing course identification details.",
      });
    }

    await prisma.registration.delete({
      where: { userId_courseId: { userId, courseId } },
    });

    return res.redirect("/student");
  } catch (error) {
    // Prevent double dropping of course
    if (error.code === "P2025") {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "You are not enrolled in this course.",
      });
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

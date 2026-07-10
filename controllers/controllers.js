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
      return res.render("register", { error: "You have an account already." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Using the default role of STUDENT since admins are often seeded manually
    await prisma.user.create({
      data: { name, email, password: hashedPassword, level: parseInt(level) },
    });

    return res.redirect("/login");
  } catch (error) {
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
};

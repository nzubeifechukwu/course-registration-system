function isAdmin(req, res, next) {
  // Redirected to login page if user is not logged in
  if (!req.isAuthenticated()) return res.redirect("/login");

  if (req.user.role !== "ADMIN") {
    return res.status(403).render("error", {
      title: "403 Forbidden",
      message: "Access denied. Only admins can view this page.",
    });
  }

  next();
}

function isStudent(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect("/login");

  if (req.user.role !== "STUDENT") {
    return res.status(403).render("error", {
      title: "403 Forbidden",
      message: "Access denied. This portal is for students only.",
    });
  }

  next();
}

module.exports = { isAdmin, isStudent };

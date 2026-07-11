const { Router } = require("express");

const {
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
} = require("../controllers/controllers");

const { isAdmin, isStudent } = require("../middleware/auth");

const router = Router();

router.get("/", home);
router.get("/login", getLogin);
router.post("/login", postLogin);
router.post("/logout", logout);
router.get("/register", getRegister);
router.post("/register", postRegister);
router.get("/admin", isAdmin, getAdminDashboard);
router.post("/admin/course", isAdmin, createCourse);
router.get("/student", isStudent, getStudentDashboard);
router.post("/student/course/register", isStudent, registerCourse);
router.post("/student/course/drop", isStudent, dropCourse);

module.exports = router;

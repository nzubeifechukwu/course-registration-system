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
  deleteCourse,
  getStudentDashboard,
  registerCourse,
  dropCourse,
} = require("../controllers/controllers");
const { isAdmin, isStudent } = require("../middleware/auth");
const {
  loginValidator,
  signUpValidator,
  courseActionValidator,
  courseCreationValidator,
} = require("../middleware/validators");

const router = Router();

router.get("/", home);
router.get("/login", getLogin);
router.post("/login", loginValidator, postLogin);
router.post("/logout", logout);
router.get("/register", getRegister);
router.post("/register", signUpValidator, postRegister);
router.get("/admin", isAdmin, getAdminDashboard);
router.post(
  "/admin/course/create",
  isAdmin,
  courseCreationValidator,
  createCourse,
);
router.post(
  "/admin/course/delete",
  isAdmin,
  courseActionValidator,
  deleteCourse,
);
router.get("/student", isStudent, getStudentDashboard);
router.post(
  "/student/course/register",
  isStudent,
  courseActionValidator,
  registerCourse,
);
router.post(
  "/student/course/drop",
  isStudent,
  courseActionValidator,
  dropCourse,
);

module.exports = router;

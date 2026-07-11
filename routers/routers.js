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
} = require("../controllers/controllers");
const { isAdmin } = require("../middleware/isAdmin");

const router = Router();

router.get("/", home);
router.get("/login", getLogin);
router.post("/login", postLogin);
router.post("/logout", logout);
router.get("/register", getRegister);
router.post("/register", postRegister);
router.get("/admin", isAdmin, getAdminDashboard);
router.post("/admin/course", isAdmin, createCourse);

module.exports = router;

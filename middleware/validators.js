const { body, validationResult } = require("express-validator");
// const prisma = require("../lib/prisma");

function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Pack the formatted errors onto the req object so the controllers can access them
    req.validationErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    req.oldData = req.body;

    return next();
  }

  next();
}

const signUpValidator = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    ),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name field cannot be left blank.")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long."),
  body("level")
    .trim()
    .notEmpty()
    .withMessage("Academic level is required.")
    .isIn(["100", "200", "300", "400"])
    .withMessage("Please select a valid academic level (e.g., 100 Level).")
    .toInt(),
  validateRequest,
];

const loginValidator = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
  validateRequest,
];

// For admins
const courseCreationValidator = [
  body("title")
    .trim()
    .toUpperCase()
    .notEmpty()
    .withMessage("Course title is required (e.g., 'PHY 101').")
    .isLength({ max: 100 })
    .withMessage("Course title must be under 100 characters."),
  body("level")
    .trim()
    .notEmpty()
    .withMessage("You must assign this course to an academic level.")
    .isIn(["100", "200", "300", "400"])
    .withMessage("Must assign the course to a valid student level.")
    .toInt(),
  validateRequest,
];

// For students to register or drop a course
const courseActionValidator = [
  body("courseId")
    .trim()
    .notEmpty()
    .withMessage(
      "A valid course identifier is required to perform this action.",
    ),
  validateRequest,
];

module.exports = {
  signUpValidator,
  loginValidator,
  courseCreationValidator,
  courseActionValidator,
};

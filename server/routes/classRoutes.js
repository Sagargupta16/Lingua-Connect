const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  checkUserRole,
} = require("../middleware/authMiddleware");
const limiter = require("../utils/limiter");
const classController = require("../controllers/classController");

// View all Classes without rate limiting
router.get("/view", authenticateUser, classController.viewAllClasses);

// View a single Class by ID with rate limiting
router.get("/view/:id", authenticateUser, classController.viewSingleClass);

// Create a Class with rate limiting (tutors only; the caller becomes its tutor)
router.post(
  "/create",
  limiter,
  authenticateUser,
  checkUserRole(["tutor"]),
  classController.createClass,
);

// Update a Class with rate limiting
router.put(
  "/update/:id",
  authenticateUser,
  limiter,
  classController.updateClass,
);

// Delete a Class with rate limiting
router.delete(
  "/delete/:id",
  authenticateUser,
  limiter,
  classController.deleteClass,
);

module.exports = router;

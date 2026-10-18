const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const testController = require("../controllers/testController");
const limiter = require("../utils/limiter");

// View all Tests without rate limiting
router.get("/view", authenticateUser, testController.viewAllTests);

// View a single Test by ID with rate limiting
router.get("/view/:id", authenticateUser, testController.viewSingleTest);

// Create a Test with rate limiting
router.post("/create", authenticateUser, limiter, testController.createTest);

// Update a Test with rate limiting
router.put("/update/:id", authenticateUser, limiter, testController.updateTest);

// Delete a Test with rate limiting
router.delete(
  "/delete/:id",
  authenticateUser,
  limiter,
  testController.deleteTest,
);

// Add a question to a Test with rate limiting
router.post(
  "/add-question/:id",
  authenticateUser,
  limiter,
  testController.addQuestion,
);

// Delete a question from a Test with rate limiting
router.delete(
  "/delete-question/:id/:questionId",
  authenticateUser,
  limiter,
  testController.deleteQuestion,
);

module.exports = router;

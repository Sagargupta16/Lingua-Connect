const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  checkUserRole,
} = require("../middleware/authMiddleware");
const studentController = require("../controllers/studentController");
const paymentController = require("../controllers/paymentController");
const limiter = require("../utils/limiter");

// View all Students without rate limiting
router.get("/view", authenticateUser, studentController.viewAllStudents);

// View a single Student by ID with rate limiting
router.get("/view/:id", authenticateUser, studentController.viewSingleStudent);

// Update a Student with rate limiting
router.put(
  "/update/:id",
  authenticateUser,
  limiter,
  studentController.updateStudent,
);

// Delete a Student with rate limiting
router.delete(
  "/delete/:id",
  authenticateUser,
  limiter,
  studentController.deleteStudent,
);

// Start a Stripe Checkout for a tutor's slot or an existing class. The
// price is read from the database; the booking is made by the webhook.
router.post(
  "/create-checkout-session",
  authenticateUser,
  checkUserRole(["student"]),
  limiter,
  paymentController.createCheckoutSession,
);

module.exports = router;

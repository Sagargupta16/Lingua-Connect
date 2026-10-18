const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const tutorController = require("../controllers/tutorController");
const limiter = require("../utils/limiter");

// View all Tutors without rate limiting
router.get("/view", authenticateUser, tutorController.viewAllTutors);

// View a single Tutor by ID with rate limiting
router.get("/view/:id", authenticateUser, tutorController.viewSingleTutor);

// Update a Tutor with rate limiting
router.put(
  "/update/:id",
  authenticateUser,
  limiter,
  tutorController.updateTutor,
);

// Delete a Tutor with rate limiting
router.delete(
  "/delete/:id",
  authenticateUser,
  limiter,
  tutorController.deleteTutor,
);

// Add a Slot to a Tutor with rate limiting
router.post(
  "/add-slot/:id",
  authenticateUser,
  limiter,
  tutorController.addSlot,
);

// Delete a Slot from a Tutor with rate limiting
router.delete(
  "/delete-slot/:id/:slotId",
  authenticateUser,
  limiter,
  tutorController.deleteSlot,
);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  checkUserRole,
} = require("../middleware/authMiddleware");
const limiter = require("../utils/limiter");
const flashcardController = require("../controllers/flashcardController");

// View all Flashcards without rate limiting
router.get(
  "/view",
  authenticateUser,
  checkUserRole(["student"]),
  flashcardController.viewAllFlashcards,
);

// View a single Flashcard by ID with rate limiting
router.get(
  "/view/:id",
  authenticateUser,
  checkUserRole(["student"]),
  flashcardController.viewSingleFlashcard,
);

// Create a Flashcard with rate limiting
router.post(
  "/create",
  authenticateUser,
  checkUserRole(["student"]),
  limiter,
  flashcardController.createFlashcard,
);

// Update a Flashcard with rate limiting
router.put(
  "/update/:id",
  authenticateUser,
  checkUserRole(["student"]),
  limiter,
  flashcardController.updateFlashcard,
);

// Delete a Flashcard with rate limiting
router.delete(
  "/delete/:id",
  authenticateUser,
  checkUserRole(["student"]),
  limiter,
  flashcardController.deleteFlashcard,
);

// Get a flashcard according to language
router.post(
  "/get/:id",
  authenticateUser,
  checkUserRole(["student"]),
  limiter,
  flashcardController.getFlashCardsByLanguage,
);

router.post(
  "/create/:id",
  authenticateUser,
  checkUserRole(["student"]),
  limiter,
  flashcardController.createFlashcardForStudent,
);

module.exports = router;

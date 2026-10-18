const logger = require("../utils/logger");
const Flashcard = require("../models/Flashcard");
const Student = require("../models/Student");
const { pickScalars } = require("../utils/sanitize");

// Fields a client may set on a flashcard; values must be scalars.
const FLASHCARD_FIELDS = ["language", "question", "answer"];

exports.viewAllFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find();
    res.json(flashcards);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.viewSingleFlashcard = async (req, res) => {
  try {
    const { id } = req.params,
      flashcard = await Flashcard.findById(id);
    if (!flashcard)
      return res.status(404).json({ errors: ["Flashcard not found"] });
    res.json(flashcard);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.createFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.create(
      pickScalars(req.body, FLASHCARD_FIELDS),
    );
    res.json(flashcard);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.updateFlashcard = async (req, res) => {
  try {
    const { id } = req.params,
      updates = pickScalars(req.body, FLASHCARD_FIELDS),
      flashcard = await Flashcard.findByIdAndUpdate(id, updates, {
        returnDocument: "after",
      });
    if (!flashcard)
      return res.status(404).json({ errors: ["Flashcard not found"] });
    res.json(flashcard);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.deleteFlashcard = async (req, res) => {
  try {
    const { id } = req.params,
      flashcard = await Flashcard.findByIdAndDelete(id);
    if (!flashcard)
      return res.status(404).json({ errors: ["Flashcard not found"] });
    res.json(flashcard);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.getFlashCardsByLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const language = req.body.language;
    const student = await Student.findById(id).populate("flashcards");
    if (!student)
      return res.status(404).json({ errors: ["Student not found"] });

    const flashcards = student.flashcards.filter((flashcard) => {
      return flashcard.language == language;
    });

    res.json(flashcards);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.createFlashcardForStudent = async (req, res) => {
  try {
    const flashcard = await Flashcard.create(
      pickScalars(req.body, FLASHCARD_FIELDS),
    );

    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student)
      return res.status(404).json({ errors: ["Student not found"] });

    student.flashcards.push(flashcard._id);
    await student.save();

    res.json(flashcard);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

const logger = require("../utils/logger");
const Flashcard = require("../models/Flashcard");
const Student = require("../models/Student");
const { pickScalars } = require("../utils/sanitize");

// Fields a client may set on a flashcard; values must be scalars.
const FLASHCARD_FIELDS = ["language", "question", "answer"];

// Load a flashcard and confirm it belongs to the caller.
const findOwnFlashcard = async (req, res) => {
  const flashcard = await Flashcard.findById(req.params.id);
  if (!flashcard) {
    res.status(404).json({ errors: ["Flashcard not found"] });
    return null;
  }
  if (!flashcard.owner?.equals(req.user._id)) {
    res.status(403).json({ errors: ["Forbidden"] });
    return null;
  }
  return flashcard;
};

// Students see only their own cards.
exports.viewAllFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ owner: req.user._id });
    res.json(flashcards);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.viewSingleFlashcard = async (req, res) => {
  try {
    const flashcard = await findOwnFlashcard(req, res);
    if (!flashcard) return;
    res.json(flashcard);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.createFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.create({
      ...pickScalars(req.body, FLASHCARD_FIELDS),
      owner: req.user._id,
    });
    await Student.updateOne(
      { _id: req.user._id },
      { $addToSet: { flashcards: flashcard._id } },
    );
    res.json(flashcard);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.updateFlashcard = async (req, res) => {
  try {
    const flashcard = await findOwnFlashcard(req, res);
    if (!flashcard) return;
    flashcard.set(pickScalars(req.body, FLASHCARD_FIELDS));
    await flashcard.save();
    res.json(flashcard);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await findOwnFlashcard(req, res);
    if (!flashcard) return;
    await flashcard.deleteOne();
    await Student.updateOne(
      { _id: req.user._id },
      { $pull: { flashcards: flashcard._id } },
    );
    res.json(flashcard);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.getFlashCardsByLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user._id.equals(id))
      return res.status(403).json({ errors: ["Forbidden"] });
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

// Same as createFlashcard, addressed by student id; the id must be the caller's.
exports.createFlashcardForStudent = async (req, res) => {
  if (!req.user._id.equals(req.params.id))
    return res.status(403).json({ errors: ["Forbidden"] });
  return exports.createFlashcard(req, res);
};

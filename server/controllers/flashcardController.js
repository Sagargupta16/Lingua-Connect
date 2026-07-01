const logger = require("../utils/logger");
const Flashcard = require("../models/Flashcard");
const Student = require("../models/Student");

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
    const flashcard = await Flashcard.create(req.body);
    res.json(flashcard);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.updateFlashcard = async (req, res) => {
  try {
    const { id } = req.params,
      flashcard = await Flashcard.findByIdAndUpdate(id, req.body, {
        new: true,
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

exports.createFlashcard = async (req, res) => {
  try {
    console.log(req.body);
    const flashcard = await Flashcard.create(req.body);

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

const Test = require("../models/Test");
const logger = require("../utils/logger");
const { pickScalars, objectArray } = require("../utils/sanitize");

// Fields a client may set/change on a test. Blocks mass-assignment of
// timestamps and any future sensitive fields, and keeps scalars only.
const testFields = (body) => {
  const data = pickScalars(body, ["language", "level"]);
  const questions = objectArray(body?.questions, ["question", "answer"]);
  if (questions) data.questions = questions;
  return data;
};

// Load a test and confirm the caller is the tutor who wrote it.
const findOwnTest = async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) {
    res.status(404).json({ errors: ["Test not found"] });
    return null;
  }
  if (!test.tutor?.equals(req.user._id)) {
    res.status(403).json({ errors: ["Forbidden"] });
    return null;
  }
  return test;
};

exports.viewAllTests = async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.viewSingleTest = async (req, res) => {
  try {
    const { id } = req.params,
      test = await Test.findById(id);
    if (!test) return res.status(404).json({ errors: ["Test not found"] });
    res.json(test);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.createTest = async (req, res) => {
  try {
    const test = new Test({ ...testFields(req.body), tutor: req.user._id });
    await test.save();
    res.json(test);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const test = await findOwnTest(req, res);
    if (!test) return;
    test.set(testFields(req.body));
    await test.save();
    res.json(test);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const test = await findOwnTest(req, res);
    if (!test) return;
    await test.deleteOne();
    res.json(test);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const test = await findOwnTest(req, res);
    if (!test) return;
    test.questions.push(pickScalars(req.body, ["question", "answer"]));
    await test.save();
    res.json(test);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const test = await findOwnTest(req, res);
    if (!test) return;
    test.questions.pull(req.params.questionId);
    await test.save();
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

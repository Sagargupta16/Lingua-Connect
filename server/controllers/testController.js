const Test = require("../models/Test");
const logger = require("../utils/logger");

// Fields a client may set/change on a test. Blocks mass-assignment of
// timestamps and any future sensitive fields.
const TEST_UPDATABLE_FIELDS = ["language", "level", "questions"];

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
    const data = {};
    for (const field of TEST_UPDATABLE_FIELDS) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }
    const test = new Test(data);
    await test.save();
    res.json(test);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    for (const field of TEST_UPDATABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    const test = await Test.findByIdAndUpdate(id, updates, { new: true });
    if (!test) return res.status(404).json({ errors: ["Test not found"] });
    res.json(test);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params,
      test = await Test.findByIdAndDelete(id);
    if (!test) return res.status(404).json({ errors: ["Test not found"] });
    res.json(test);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { id } = req.params,
      test = await Test.findById(id);
    if (!test) return res.status(404).json({ errors: ["Test not found"] });
    test.questions.push(req.body);
    await test.save();
    res.json(test);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id, questionId } = req.params,
      test = await Test.findById(id);
    if (!test) return res.status(404).json({ errors: ["Test not found"] });
    test.questions.pull(questionId);
    await test.save();
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

const Test = require("../models/Test");
const logger = require("../utils/logger");

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
    const test = new Test(req.body);
    await test.save();
    res.json(test);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const { id } = req.params,
      test = await Test.findByIdAndUpdate(id, req.body, { new: true });
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

const logger = require("../utils/logger");
const Class = require("../models/Class");

exports.viewAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.viewSingleClass = async (req, res) => {
  try {
    const { id } = req.params,
      class_ = await Class.findById(id);
    if (!class_) return res.status(404).json({ errors: ["Class not found"] });
    res.json(class_);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.createClass = async (req, res) => {
  try {
    const class_ = await Class.create(req.body);
    res.json(class_);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params,
      class_ = await Class.findByIdAndUpdate(id, req.body, {
        returnDocument: "after",
      });

    if (!class_) return res.status(404).json({ errors: ["Class not found"] });
    res.json(class_);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params,
      class_ = await Class.findByIdAndDelete(id);
    if (!class_) return res.status(404).json({ errors: ["Class not found"] });
    res.json(class_);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

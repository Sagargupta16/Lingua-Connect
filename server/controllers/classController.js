const logger = require("../utils/logger");
const Class = require("../models/Class");
const { pickScalars } = require("../utils/sanitize");

// Fields a client may set on a class. Timestamps and anything outside the
// schema are dropped, and every value must be a scalar.
const CLASS_FIELDS = [
  "language",
  "tutor",
  "startTime",
  "duration",
  "price",
  "isCancelled",
  "level",
  "videoId",
];

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
    const class_ = await Class.create(pickScalars(req.body, CLASS_FIELDS));
    res.json(class_);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params,
      updates = pickScalars(req.body, CLASS_FIELDS),
      class_ = await Class.findByIdAndUpdate(id, updates, {
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

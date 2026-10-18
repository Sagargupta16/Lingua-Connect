const logger = require("../utils/logger");
const Class = require("../models/Class");
const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const { pickScalars } = require("../utils/sanitize");

// Fields a client may set on a class. Timestamps, the owning tutor and
// anything outside the schema are dropped, and every value must be a scalar.
const CLASS_FIELDS = [
  "language",
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

// Load a class and confirm the caller is the tutor who owns it.
const findOwnClass = async (req, res) => {
  const class_ = await Class.findById(req.params.id);
  if (!class_) {
    res.status(404).json({ errors: ["Class not found"] });
    return null;
  }
  if (!class_.tutor.equals(req.user._id)) {
    res.status(403).json({ errors: ["Forbidden"] });
    return null;
  }
  return class_;
};

// Tutors create classes for themselves; students get classes by paying.
exports.createClass = async (req, res) => {
  try {
    const class_ = await Class.create({
      ...pickScalars(req.body, CLASS_FIELDS),
      tutor: req.user._id,
    });
    await Tutor.updateOne(
      { _id: req.user._id },
      { $addToSet: { classes: class_._id } },
    );
    res.json(class_);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const class_ = await findOwnClass(req, res);
    if (!class_) return;
    class_.set(pickScalars(req.body, CLASS_FIELDS));
    await class_.save();
    res.json(class_);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const class_ = await findOwnClass(req, res);
    if (!class_) return;
    await class_.deleteOne();
    // Drop the ref everywhere so populate() never returns a null class.
    await Tutor.updateMany(
      { classes: class_._id },
      { $pull: { classes: class_._id } },
    );
    await Student.updateMany(
      { classes: class_._id },
      { $pull: { classes: class_._id } },
    );
    res.json(class_);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

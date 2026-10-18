const Tutor = require("../models/Tutor");
const logger = require("../utils/logger");
const {
  pickScalars,
  scalarArray,
  objectArray,
} = require("../utils/sanitize");
const { v4: uuidv4 } = require("uuid");

exports.viewAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find().populate("classes");
    res.json(tutors);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.viewSingleTutor = async (req, res) => {
  try {
    const { id } = req.params,
      tutor = await Tutor.findById(id).populate("classes");
    if (!tutor) return res.status(404).json({ errors: ["Tutor not found"] });
    res.json(tutor);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

// Fields a client may change via update. Blocks mass-assignment of
// role, password, rating (self-inflation) and ObjectId ref arrays, and
// keeps scalars only so no operator can ride along in a value.
const SLOT_FIELDS = [
  "id",
  "date",
  "startTime",
  "duration",
  "price",
  "language",
];
const tutorUpdates = (body) => {
  const updates = pickScalars(body, ["name", "email", "yearsOfExperience"]);
  const languages = scalarArray(body?.languages);
  if (languages) updates.languages = languages;
  const slots = objectArray(body?.slotsAvailability, SLOT_FIELDS);
  if (slots) updates.slotsAvailability = slots;
  return updates;
};

exports.updateTutor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user._id.equals(id))
      return res.status(403).json({ errors: ["Forbidden"] });
    const tutor = await Tutor.findByIdAndUpdate(id, tutorUpdates(req.body), {
      returnDocument: "after",
    });
    if (!tutor) return res.status(404).json({ errors: ["Tutor not found"] });
    res.json(tutor);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.deleteTutor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user._id.equals(id))
      return res.status(403).json({ errors: ["Forbidden"] });
    const tutor = await Tutor.findByIdAndDelete(id);
    if (!tutor) return res.status(404).json({ errors: ["Tutor not found"] });
    res.json(tutor);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

// Add a Slot to a Tutor with rate limiting. Tutors manage only their own
// slots; the slot fields are allow-listed and the id is generated here.
exports.addSlot = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user._id.equals(id))
      return res.status(403).json({ errors: ["Forbidden"] });
    const tutor = await Tutor.findById(id);
    if (!tutor) return res.status(404).json({ errors: ["Tutor not found"] });
    const slot = pickScalars(
      req.body,
      SLOT_FIELDS.filter((field) => field !== "id"),
    );
    slot.id = uuidv4();
    tutor.slotsAvailability.push(slot);
    await tutor.save();
    res.json(tutor);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

// Delete a Slot from a Tutor with rate limiting
exports.deleteSlot = async (req, res) => {
  try {
    const { id, slotId } = req.params;
    if (!req.user._id.equals(id))
      return res.status(403).json({ errors: ["Forbidden"] });
    const tutor = await Tutor.findById(id);
    if (!tutor) return res.status(404).json({ errors: ["Tutor not found"] });
    const slots = tutor.slotsAvailability.filter((slot) => slot._id != slotId);
    tutor.slotsAvailability = slots;
    await tutor.save();
    res.json(tutor);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

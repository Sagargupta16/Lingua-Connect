const Student = require("../models/Student");
const logger = require("../utils/logger");
const { pickScalars } = require("../utils/sanitize");

exports.viewAllStudents = async (req, res) => {
   try {
      const students = await Student.find();
      res.json(students);
   } catch (error) {
      logger.error(error);
      res.status(500).json({ errors: ["Internal server error"] });
   }
};

exports.viewSingleStudent = async (req, res) => {
   try {
      const { id } = req.params,
         student = await Student.findById(id)
            .populate("classes")
            .populate("tests")
            .populate("flashcards");
      if (!student)
         return res.status(404).json({ errors: ["Student not found"] });
      res.json(student);
   } catch (error) {
      logger.error(error);
      res.status(500).json({ errors: ["Internal server error"] });
   }
};

// Fields a client may change via update. Blocks mass-assignment of
// role, password (has its own reset flow) and ObjectId ref arrays.
const STUDENT_UPDATABLE_FIELDS = ["name", "email"];

exports.updateStudent = async (req, res) => {
   try {
      const { id } = req.params;
      if (!req.user._id.equals(id))
         return res.status(403).json({ errors: ["Forbidden"] });
      const updates = pickScalars(req.body, STUDENT_UPDATABLE_FIELDS);
      const student = await Student.findByIdAndUpdate(id, updates, {
         returnDocument: "after",
      });
      if (!student)
         return res.status(404).json({ errors: ["Student not found"] });
      res.json(student);
   } catch (error) {
      logger.error(error);
      res.status(500).json({ errors: ["Internal server error"] });
   }
};

exports.deleteStudent = async (req, res) => {
   try {
      const { id } = req.params;
      if (!req.user._id.equals(id))
         return res.status(403).json({ errors: ["Forbidden"] });
      const student = await Student.findByIdAndDelete(id);
      if (!student)
         return res.status(404).json({ errors: ["Student not found"] });
      res.json(student);
   } catch (error) {
      logger.error(error);
      res.status(500).json({ errors: ["Internal server error"] });
   }
};

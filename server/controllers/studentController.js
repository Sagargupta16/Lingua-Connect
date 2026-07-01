const Student = require("../models/Student");
const logger = require("../utils/logger");
const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY
);
const Class = require("../models/Class");

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
    const updates = {};
    for (const field of STUDENT_UPDATABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    const student = await Student.findByIdAndUpdate(id, updates, { new: true });
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
    const { id } = req.params,
      student = await Student.findByIdAndDelete(id);
    if (!student)
      return res.status(404).json({ errors: ["Student not found"] });
    res.json(student);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const item = req.body;

    const lineItem = {
      price_data: {
        currency: "inr",
        product_data: {
          name: item.description,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    };

    const customer = await stripe.customers.create({
      name: "Jenny Rosen",
      address: {
        line1: "510 Townsend St",
        postal_code: "98140",
        city: "San Francisco",
        state: "CA",
        country: "US",
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [lineItem],
      mode: "payment",
      customer: customer.id,
      success_url: `${process.env.CLIENT_URL}/profile`,
      cancel_url: `${process.env.CLIENT_URL}/payment-failed`,
    });
    res.json({ id: session.id });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

// Add a class to a Student with rate limiting
exports.addClass = async (req, res) => {
  try {
    const { id } = req.params,
      student = await Student.findById(id);
    if (!student)
      return res.status(404).json({ errors: ["Student not found"] });
    student.classes.push(req.body);
    await student.save();
    res.json(student);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ errors: ["Internal server error"] });
  }
};

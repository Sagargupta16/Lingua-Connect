const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    language: { type: String, required: true },
    level: { type: String, required: true },
    // The tutor who wrote the test; only they may change or delete it.
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },
    questions: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

const Test = mongoose.model("Test", testSchema);

module.exports = Test;

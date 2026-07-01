const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    language: { type: String, required: true },
    level: { type: String, required: true },
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

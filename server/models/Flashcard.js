const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
  {
    language: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    // The student who owns the card; other users cannot read or edit it.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  },

  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

module.exports = Flashcard;

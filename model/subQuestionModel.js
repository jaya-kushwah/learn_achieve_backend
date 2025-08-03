// const mongoose = require("mongoose");

// const subQuestionSchema = new mongoose.Schema({
//   parentId: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionBank", required: true },
//   questionText: { type: String, required: true },
//   options: [{ type: String, required: true }],
//   correctAnswer: { type: String, required: true },
// }, { timestamps: true });

// subQuestionSchema.index({ parentId: 1, questionText: 1 }, { unique: true });

// module.exports = mongoose.model("SubQuestion", subQuestionSchema);

const mongoose = require("mongoose");

const subQuestionSchema = new mongoose.Schema({
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionBank", required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
}, { timestamps: true });

subQuestionSchema.index({ parentId: 1, questionText: 1 }, { unique: true });

module.exports = mongoose.model("SubQuestion", subQuestionSchema);
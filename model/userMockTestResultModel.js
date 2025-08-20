
// const mongoose = require("mongoose");

// const responseSchema = new mongoose.Schema({
//   questionId: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionBank", required: true },
//   selectedOption: { type: String },
//   isCorrect: { type: Boolean },
//   correctAnswer: { type: String },
// });

// const mockTestResultSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: "MockTest", required: true },
//   packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
//   attempted: Number,
//   correct: Number,
//   wrong: Number,
//   unattempted: Number,
//   totalMarks: Number,
//   responses: [responseSchema],
// }, { timestamps: true });

// module.exports = mongoose.model("UserMockTestResult", mockTestResultSchema);


const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionBank", required: true },
subQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubQuestion' },

  selectedOption: { type: String },
  isCorrect: { type: Boolean },
  correctAnswer: { type: String },
});

const mockTestResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: "MockTest", required: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
  attempted: Number,
  correct: Number,
  wrong: Number,
  unattempted: Number,
  totalMarks: Number,
    attemptNumber: Number ,
  responses: [responseSchema],
}, { timestamps: true });

module.exports = mongoose.model("UserMockTestResult", mockTestResultSchema);
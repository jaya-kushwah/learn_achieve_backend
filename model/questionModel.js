const mongoose = require("mongoose");

const questionBankSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "ClassMaster", required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  medium: { type: String, enum: ["Hindi", "English", "Semi-English", "Marathi"], required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  module: { type: String, required: true },
  topicName: { type: String, required: true },
  typeOfQuestion: { type: String, enum: ["General", "Comprehensive", "Poem"], required: true },
  questionType: { type: String, enum: ["Question Bank", "SAT Exam"], required: true },

    questionText: { type: String },
  options: [String], 
  correctAnswer: { type: String }, 
  solution: { type: String }, 
}, { timestamps: true });

questionBankSchema.index({
  classId: 1, subjectId: 1, medium: 1, module: 1, topicName: 1,
  typeOfQuestion: 1, questionType: 1
}, { unique: true });

module.exports = mongoose.model("QuestionBank", questionBankSchema);

// const mongoose = require("mongoose");

// const questionBankSchema = new mongoose.Schema({
//   mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: "MockTest", required: true },
//   classId: { type: mongoose.Schema.Types.ObjectId, ref: "ClassMaster", required: true },
//   subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
//   medium: { type: String, enum: ["Hindi", "English", "Semi-English", "Marathi"], required: true },
//   status: { type: String, enum: ['active', 'inactive'], default: 'active' },
//   module: { type: String, required: true },
//   topicName: { type: String, required: true },
//   typeOfQuestion: { type: String, enum: ["General", "Comprehensive", "Poem"], required: true },
//   questionType: { type: String, enum: ["Question Bank", "SAT Exam"], required: true },

//   //  Only for General
//   questionText: { type: String },
//   options: [{ type: String }],
//   correctAnswer: { type: String },
// }, { timestamps: true });

// questionBankSchema.index({
//   classId: 1, subjectId: 1, medium: 1, module: 1, topicName: 1,
//   typeOfQuestion: 1, questionType: 1
// }, { unique: true });

// module.exports = mongoose.model("QuestionBank", questionBankSchema);
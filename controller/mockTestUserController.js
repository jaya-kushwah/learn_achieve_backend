
const { getMockTestDetailsService } = require('../service/mockTestUserService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const QuestionBank = require("../model/questionModel");
const MockTest = require("../model/mockTestModel"); 
const mongoose = require('mongoose');

const Question = require('../model/questionModel');
const SubQuestion = require('../model/subQuestionModel');

exports.getMockTestDetails = async (req, res) => {
  try {
    const { mockTestId } = req.params;

    const mockTest = await MockTest.findById(mockTestId)
      .populate("class")
      .populate("subjects");

    if (!mockTest) {
      return res.status(404).json({ success: false, message: "Mock test not found" });
    }

    // 🧹 Load all questions (without mockTestId because it's removed)
    const allQuestions = await QuestionBank.find({});

    
const subjectQuestions = mockTest.subjects.map(subject => {
  const questions = allQuestions.filter(q => {
    // console.log("Checking Question:", q._id);
    // console.log("Subject Match:", q.subjectId?.toString() === subject._id.toString());
    // console.log("Class Match:", q.classId?.toString() === mockTest.class[0]._id.toString());
    // console.log("Medium Match:", mockTest.medium.includes(q.medium));

    return (
      q.subjectId?.toString() === subject._id.toString() &&
      q.classId?.toString() === mockTest.class[0]._id.toString() &&
      mockTest.medium.includes(q.medium)
    );
  });

  return {
    subjectId: subject._id,
    questions
  };
});

    // Return final response
    res.status(200).json({
      success: true,
      message: "Mock test fetched successfully",
      data: {
        ...mockTest._doc,
        subjectQuestions
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getQuestionsBySubject = async (req, res) => {
  try {
    const { mockTestId, subjectId } = req.params;

    const mockTest = await MockTest.findById(mockTestId).populate('subjects');

    if (!mockTest) {
      return res.status(404).json({ success: false, message: 'Mock test not found' });
    }

    const subjectExists = mockTest.subjects.some(
      (subj) => subj._id.toString() === subjectId
    );

    if (!subjectExists) {
      return res.status(400).json({ success: false, message: 'Subject not found in this mock test' });
    }

    // TEMP FIX: Remove mockTestId from filter
    const questions = await Question.find({
      subjectId: new mongoose.Types.ObjectId(subjectId)
    }).lean();

    // const formattedQuestions = await Promise.all(
    //   questions.map(async (q) => {
    //     const subQuestions = await SubQuestion.find({ questionId: q._id }).lean();
    //     return {
    //       questionId: q._id,
    //       question: q.questionText,
    //       options: q.options,
    //       questionType: q.questionType,
    //       typeOfQuestion: q.typeOfQuestion,
    //       subQuestions: subQuestions.map(sub => ({
    //         subQuestionId: sub._id,
    //         question: sub.question,
    //         options: sub.options
    //       }))
    //     };
    //   })
    // );

    const formattedQuestions = await Promise.all(
  questions.map(async (q) => {
    const subQuestions = await SubQuestion.find({ parentId: q._id }).lean();

    return {
      questionId: q._id,
      question: q.questionText,
      options: q.options,
      questionType: q.questionType,
      typeOfQuestion: q.typeOfQuestion,
      subQuestions: subQuestions.map(sub => ({
        subQuestionId: sub._id,
        question: sub.questionText,
        options: sub.options
      }))
    };
  })
);

    res.status(200).json({
      success: true,
      message: 'Questions fetched successfully',
      data: {
        subjectId,
        questions: formattedQuestions
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
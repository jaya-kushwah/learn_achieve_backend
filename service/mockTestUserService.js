
const MockTest = require('../model/mockTestModel');
const Subject = require('../model/subjectModel');
const Question = require('../model/questionModel');
const SubQuestion = require('../model/subQuestionModel');

exports.getMockTestDetailsService = async (mockTestId) => {
  const mockTest = await MockTest.findById(mockTestId)
    .populate('subjects')
    .lean();

  if (!mockTest) throw new Error('MockTest not found');

  // Prepare subjects section
  const subjects = mockTest.subjects.map(subject => ({
    subjectId: subject._id,
    subjectName: subject.name,
    numberOfQuestions: subject.numberOfQuestions || 0,
    medium: subject.medium
  }));

  // Prepare subjectQuestions
  const subjectQuestions = [];

  for (const subject of mockTest.subjects) {
    const questions = await Question.find({ subjectId: subject._id, mockTestId })
      .lean();

    const formattedQuestions = [];

    for (const q of questions) {
      const subQuestions = await SubQuestion.find({ questionId: q._id }).lean();

      formattedQuestions.push({
        questionId: q._id,
        question: q.question,
        options: q.options,
        questionType: q.questionType,
        typeOfQuestion: q.typeOfQuestion,
        subQuestions: subQuestions.map(sub => ({
          subQuestionId: sub._id,
          question: sub.question,
          options: sub.options
        }))
      });
    }

    subjectQuestions.push({
      subjectId: subject._id,
      questions: formattedQuestions
    });
  }

  return {
    mockTestId: mockTest._id,
    mockTestName: mockTest.mockTestName,
    durationInMinutes: mockTest.duration,
    subjects,
    subjectQuestions
  };
};
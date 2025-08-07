
const Question = require('../model/questionModel');
const UserMockTestResult = require('../model/userMockTestResultModel');

exports.submitMockTestService = async ({ userId, mockTestId, packageId, answers }) => {
  let attempted = 0;
  let correct = 0;
  let wrong = 0;
  const responses = [];

  for (const ans of answers) {
    const question = await Question.findById(ans.questionId);
    if (!question) continue;

    const isCorrect = question.correctAnswer === ans.selectedOption;

    if (ans.selectedOption) attempted++;
    if (isCorrect) correct++;
    else if (ans.selectedOption) wrong++;

    responses.push({
      questionId: question._id,
      selectedOption: ans.selectedOption || null,
      isCorrect,
      correctAnswer: question.correctAnswer
    });
  }

  const totalMarks = correct;
  const unattempted = answers.length - attempted;

  const result = await UserMockTestResult.create({
    userId,
    mockTestId,
    packageId,
    attempted,
    correct,
    wrong,
    unattempted,
    totalMarks,
    responses
  });

  return result;
};

// const Question = require('../model/questionModel');
// const UserMockTestResult = require('../model/userMockTestResultModel');

// exports.submitMockTestService = async ({ userId, mockTestId, packageId, answers }) => {
//   let attempted = 0;
//   let correct = 0;
//   let wrong = 0;
//   const responses = [];

//   for (const ans of answers) {
//     const question = await Question.findById(ans.questionId);
//     if (!question) continue;

//     const isCorrect = question.correctAnswer === ans.selectedOption;

//     if (ans.selectedOption) attempted++;
//     if (isCorrect) correct++;
//     else if (ans.selectedOption) wrong++;

//     responses.push({
//       questionId: question._id,
//       selectedOption: ans.selectedOption || null,
//       isCorrect,
//       correctAnswer: question.correctAnswer
//     });
//   }

//   const totalMarks = correct;
//   const unattempted = answers.length - attempted;

//   const result = await UserMockTestResult.create({
//     userId,
//     mockTestId,
//     packageId,
//     attempted,
//     correct,
//     wrong,
//     unattempted,
//     totalMarks,
//     responses
//   });

//   return result;
// };




// // const Question = require('../model/questionModel');
// // const UserMockTestResult = require('../model/userMockTestResultModel');

// // exports.submitMockTestService = async ({ userId, mockTestId, packageId, answers }) => {
// //   let attempted = 0;
// //   let correct = 0;
// //   let wrong = 0;
// //   const responses = [];

// //   for (const ans of answers) {
// //     const question = await Question.findById(ans.questionId);
// //     if (!question) continue;

// //     const isCorrect = question.correctAnswer === ans.selectedOption;

// //     if (ans.selectedOption) attempted++;
// //     if (isCorrect) correct++;
// //     else if (ans.selectedOption) wrong++;

// //     responses.push({
// //       questionId: question._id,
// //       selectedOption: ans.selectedOption || null,
// //       isCorrect,
// //       correctAnswer: question.correctAnswer
// //     });
// //   }

// //   const totalMarks = correct;
// //   const unattempted = answers.length - attempted;

// //   const result = await UserMockTestResult.create({
// //     userId,
// //     mockTestId,
// //     packageId,
// //     attempted,
// //     correct,
// //     wrong,
// //     unattempted,
// //     totalMarks,
// //     responses
// //   });

// //   return result;
// // };
// const Question = require('../model/questionModel');
// const UserMockTestResult = require('../model/userMockTestResultModel');

// exports.submitMockTestService = async ({ userId, mockTestId, packageId, answers }) => {
//   // Find existing result
//   let existingResult = await UserMockTestResult.findOne({ userId, mockTestId });

//   let attemptNumber = existingResult ? existingResult.attemptNumber + 1 : 1;
//   if (attemptNumber > 3) {
//     throw new Error("You have already attempted this mock test 3 times");
//   }

//   // Evaluate answers
//   let attempted = 0, correct = 0, wrong = 0;
//   const responses = [];

//   for (const ans of answers) {
//     const question = await Question.findById(ans.questionId);
//     if (!question) continue;

//     const isCorrect = question.correctAnswer === ans.selectedOption;

//     if (ans.selectedOption) {
//       attempted++;
//       if (isCorrect) correct++;
//       else wrong++;
//     }

//     responses.push({
//       questionId: question._id,
//       selectedOption: ans.selectedOption || null,
//       isCorrect,
//       correctAnswer: question.correctAnswer
//     });
//   }

//   const totalQuestions = answers.length;
//   const unattempted = totalQuestions - attempted;
//   const totalMarks = correct; // ✅ only correct answers give marks

//   // Update or Insert
//   const result = await UserMockTestResult.findOneAndUpdate(
//     { userId, mockTestId },
//     {
//       userId,
//       mockTestId,
//       packageId,
//       attempted,
//       correct,
//       wrong,
//       unattempted,
//       totalMarks,
//       responses,
//       attemptNumber
//     },
//     { new: true, upsert: true }
//   );

//   return {
//     ...result.toObject(),
//     totalQuestions
//   };
// };


const Question = require('../model/questionModel');
const UserMockTestResult = require('../model/userMockTestResultModel');

exports.submitMockTestService = async ({ userId, mockTestId, packageId, answers }) => {
  // Find existing result
  let existingResult = await UserMockTestResult.findOne({ userId, mockTestId });

  let attemptNumber = existingResult ? existingResult.attemptNumber + 1 : 1;
  if (attemptNumber > 3) {
    throw new Error("You have already attempted this mock test 3 times");
  }

  // Evaluate answers
  let attempted = 0, correct = 0, wrong = 0;
  const responses = [];

  for (const ans of answers) {
    const question = await Question.findById(ans.questionId);
    if (!question) continue;

    const isCorrect = question.correctAnswer === ans.selectedOption;

    if (ans.selectedOption) {
      attempted++;
      if (isCorrect) correct++;
      else wrong++;
    }

    responses.push({
      questionId: question._id,
        subQuestionId: ans.subQuestionId || null, 
      selectedOption: ans.selectedOption || null,
      isCorrect,
      correctAnswer: question.correctAnswer
    });
  }

  const totalQuestions = answers.length;
  const unattempted = totalQuestions - attempted;
  const totalMarks = correct; // ✅ marks = correct only

  // Update or Insert
  const result = await UserMockTestResult.findOneAndUpdate(
    { userId, mockTestId },
    {
      userId,
      mockTestId,
      packageId,
      attempted,
      correct,
      wrong,
      unattempted,
      totalMarks,
      responses,
      attemptNumber
    },
    { new: true, upsert: true }
  );

  // ✅ Return full data with populated responses
  return await UserMockTestResult.findById(result._id)
    .populate({
      path: "responses.questionId",
      select: "questionText correctAnswer options subjectId"
    })
    .populate({
      path: "mockTestId",
      select: "mockTestName duration subjects totalQuestions"
    })
    .lean();
};
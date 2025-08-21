
const UserMockTestResult = require('../model/userMockTestResultModel');

exports.submitMockTest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mockTestId, packageId, answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Answers array is required and cannot be empty",
      });
    }

    // ✅ Check previous attempts
    const previousAttempts = await UserMockTestResult.countDocuments({ userId, mockTestId });
    if (previousAttempts >= 3) {
      return res.status(400).json({
        success: false,
        message: "You have already attempted this mock test 3 times. No more attempts allowed.",
      });
    }

    const attemptNumber = previousAttempts + 1;

    let attempted = 0,
        correct = 0,
        wrong = 0;

    const processedResponses = [];

    for (let ans of answers) {
      // ✅ Normal or main question
      if (ans.selectedOption) {
        attempted++;
        let isCorrect = false;
        if (ans.selectedOption === ans.correctAnswer) {
          isCorrect = true;
          correct++;
        } else {
          wrong++;
        }

        processedResponses.push({
          questionId: ans.questionId,
          subQuestionId: ans.subQuestionId || null, // 🔹 save frontend subQuestionId if exists
          selectedOption: ans.selectedOption,
          correctAnswer: ans.correctAnswer || null,
          isCorrect,
        });
      }

      // ✅ Sub-questions array (agar frontend ne diya ho)
      if (ans.subAnswers && Array.isArray(ans.subAnswers)) {
        ans.subAnswers.forEach(sub => {
          if (sub.selectedOption) attempted++;

          let isCorrect = false;
          if (sub.selectedOption && sub.selectedOption === sub.correctAnswer) {
            isCorrect = true;
            correct++;
          } else if (sub.selectedOption) {
            wrong++;
          }

          processedResponses.push({
            questionId: ans.questionId,
            subQuestionId: sub.subQuestionId || null,
            selectedOption: sub.selectedOption,
            correctAnswer: sub.correctAnswer || null,
            isCorrect,
          });
        });
      }
    }

    const unattempted = processedResponses.length - attempted;
    const totalMarks = correct;

    // ✅ Save result
    const newResult = new UserMockTestResult({
      userId,
      mockTestId,
      packageId,
      attemptNumber,
      attempted,
      correct,
      wrong,
      unattempted,
      totalMarks,
      responses: processedResponses,
    });

    await newResult.save();

  const populatedResult = await UserMockTestResult.findById(newResult._id)
  .populate({ path: "responses.questionId", select: "questionText correctAnswer options" })
  .populate({ path: "responses.subQuestionId", select: "subQuestionText correctAnswer" });


    return res.json({
      success: true,
      message: "Mock test submitted successfully",
      data: populatedResult,
    });
  } catch (error) {
    console.error("Submit Mock Test Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getMockTestResult = async (req, res) => {
  try {
    const { resultId, mockTestId } = req.params;
    const query = {};

    if (resultId) query._id = resultId;
    if (mockTestId) query.mockTestId = mockTestId;

    let result = await UserMockTestResult.findOne(query)
      .populate({
        path: "mockTestId",
        select: "mockTestName duration subjects totalQuestions"
      })
      .populate({
        path: "responses.questionId",
        select: "classId subjectId medium status module topicName typeOfQuestion questionType questionText correctAnswer options reviewStatus updatedBy createdAt updatedAt",
        populate: {
          path: "subjectId",
          select: "name"
        }
      })
      .populate({
        path: "responses.subQuestionId",
        select: "parentId questionText options correctAnswer createdAt updatedAt"
      })
      .lean();

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found"
      });
    }

    // 🔥 Add correctAnswer from populated question/subQuestion
    result.responses = result.responses.map(r => {
      let correctAnswer = r.correctAnswer || null;

      if (!correctAnswer) {
        if (r.subQuestionId && r.subQuestionId.correctAnswer) {
          correctAnswer = r.subQuestionId.correctAnswer;
        } else if (r.questionId && r.questionId.correctAnswer) {
          correctAnswer = r.questionId.correctAnswer;
        }
      }

      return {
        ...r,
        correctAnswer
      };
    });

    res.json({
      success: true,
      message: "Mock test result fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error fetching mock test result:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

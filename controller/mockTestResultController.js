
const { submitMockTestService } = require('../service/mockTestResultService');
const UserMockTestResult = require('../model/userMockTestResultModel');
const { successResponse, errorResponse } = require('../utils/response');

exports.submitMockTest = async (req, res) => {
  try {
    const userId = req.user.id; // from token
    const { mockTestId, packageId, answers } = req.body;

    const result = await submitMockTestService({ userId, mockTestId, packageId, answers });

    return successResponse(res, 'Mock test submitted successfully', result);
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Submission failed');
  }
};

exports.getMockTestResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mockTestId } = req.params;

    const result = await UserMockTestResult.findOne({ userId, mockTestId })
      .populate('responses.questionId', 'questionText options')
      .lean();

    if (!result) return errorResponse(res, 'Result not found', 404);

    return successResponse(res, 'Mock test result fetched', result);
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Error fetching result');
  }
};
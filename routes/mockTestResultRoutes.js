const express = require('express');
const router = express.Router();
const { submitMockTest, getMockTestResult } = require('../controller/mockTestResultController');
const { verifyUserToken } = require('../middleware/userAuth');


// Submit mock test
router.post('/mocktest/submit',verifyUserToken, submitMockTest);

router.get('/:mockTestId', verifyUserToken, getMockTestResult);

module.exports = router;
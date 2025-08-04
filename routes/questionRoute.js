const express = require("express");
const router = express.Router();
const questionBankController = require("../controller/questionController");

// Parent Question API
router.post("/", questionBankController.createOrUpdateQuestionBank);

// Subquestion APIs
router.post("/subquestion", questionBankController.addSubQuestion);
router.get("/subquestion/:parentId", questionBankController.getSubQuestions);
router.delete("/subquestion/:id", questionBankController.deleteSubQuestion);

// Filter, status, delete
router.get("/filter", questionBankController.getFilteredQuestionBank);
router.put('/status/:id', questionBankController.changeStatus);
router.delete('/delete', questionBankController.deleteSubjectSmart);

module.exports = router;
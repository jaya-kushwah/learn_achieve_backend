
const questionBankService = require("../service/questionService");
const { validateMainQuestion, validateSubQuestion } = require("../validation/questionValidation")
 
exports.createOrUpdateQuestionBank = async (req, res) => {
  try {
    const { error } = validateMainQuestion.validate(req.body);
    if (error) return res.status(422).json({ success: false, message: error.message });

    const result = await questionBankService.createOrUpdateQuestionBank(req.body);
    res.status(200).json({ success: true, message: req.body.id ? "Updated" : "Created", data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.addSubQuestion = async (req, res) => {
  try {
    if (!req.body.options && req.body['options[0]']) {
      const options = [];
      for (let i = 0; i < 10; i++) {
        const key = `options[${i}]`;
        if (req.body[key]) {
          options.push(req.body[key]);
        } else {
          break;
        }
      }
      req.body.options = options;
    }

    const { error } = validateSubQuestion.validate(req.body);
    if (error) return res.status(422).json({ success: false, message: error.message });

    const result = await questionBankService.addSubQuestion(req.body);
    res.status(200).json({ success: true, message: "Subquestion added", data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};



exports.getSubQuestions = async (req, res) => {
  try {
    const subQuestions = await questionBankService.getSubQuestions(req.params.parentId);
    res.status(200).json({ success: true, subQuestions });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteSubQuestion = async (req, res) => {
  try {
    await questionBankService.deleteSubQuestion(req.params.id);
    res.status(200).json({ success: true, message: "Subquestion deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};



exports.getFilteredQuestionBank = async (req, res) => {
  try {
    const result = await questionBankService.getFilteredQuestionBank(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.changeStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await questionBankService.updateStatus(id, status);
      res.status(200).json({ message: 'Status updated', question: result });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };



  // Smart Delete (single or multiple)
    exports.deleteSubjectSmart =async (req, res) => {
      try {
        const { id, ids } = req.body;
  
        if (id) {
          await questionBankService.deleteSubject(id);
          return res.status(200).json({ message: 'question deleted' });
        }
  
        if (Array.isArray(ids) && ids.length > 0) {
          await questionBankService.deleteMultiple(ids);
          return res.status(200).json({ message: 'questions deleted successfully' });
        }
  
        return res.status(400).json({ message: 'Please provide id or ids[] to delete' });
      } catch (err) {
        res.status(500).json({ message: 'Delete failed', error: err.message });
      }
    };

   
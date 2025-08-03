const QuestionBank = require("../model/questionModel");
require("../model/classMasterModel");
require("../model/subjectModel");
const SubQuestion = require("../model/subQuestionModel")

exports.createOrUpdateQuestionBank = async (data) => {
  console.log("DATA",data);

  const {
  id,
  classId,
  subjectId,
  medium,
  module,
  topicName,
  typeOfQuestion,
  questionType,
  questionText,
  options,
  correctAnswer,
  solution
} = data;


  const cleanModule = module.trim();
  const cleanTopic = topicName.trim();

  if (id) {
    // Update flow
    const updated = await QuestionBank.findById(id);
    if (!updated) throw new Error("Question not found");

    updated.classId = classId;
    updated.subjectId = subjectId;
    updated.medium = medium;
    updated.module = cleanModule;
    updated.topicName = cleanTopic;
    updated.typeOfQuestion = typeOfQuestion;
    updated.questionType = questionType;
    updated.questionText = questionText;
    updated.options = options;
updated.correctAnswer = correctAnswer;
updated.solution = solution;


    await updated.save(); //  Explicit save
    return updated;
  } else {
    // Duplicate check
    const exists = await QuestionBank.findOne({
      classId,
      subjectId,
      medium,
      module: cleanModule,
      topicName: cleanTopic,
      typeOfQuestion,
      questionType,
      questionText
    });

    if (exists) {
      throw new Error("This Question Bank entry already exists.");
    }

    const question = new QuestionBank({
  classId,
  subjectId,
  medium,
  module: cleanModule,
  topicName: cleanTopic,
  typeOfQuestion,
  questionType,
  questionText,
  options,
  correctAnswer,
  solution
});


    await question.save(); // 
    return question;
  }
};

exports.addSubQuestion = async (data) => {
  const { parentId, questionText, options, correctAnswer } = data;

  const trimmedQuestion = questionText.trim();
  const trimmedOptions = options.map(opt => opt.trim());
  const trimmedAnswer = correctAnswer.trim();

  // Duplicate check
  const duplicate = await SubQuestion.findOne({
    parentId,
    questionText: trimmedQuestion,
    correctAnswer: trimmedAnswer,
    options: trimmedOptions,
  });

  if (duplicate) throw new Error("Subquestion already exists under this parent.");

  const subQuestion = new SubQuestion({
    parentId,
    questionText: trimmedQuestion,
    options: trimmedOptions,
    correctAnswer: trimmedAnswer,
  });

  await subQuestion.save(); 
  return subQuestion;
};

exports.getSubQuestions = async (parentId) => {
  return await SubQuestion.find({ parentId }).sort({ createdAt: -1 });
};

exports.getFilteredQuestionBank = async (query) => {
  const { offset = 0, limit = 10, classId, subjectId, medium } = query;

  const filter = {};
  if (classId) filter.classId = classId;
  if (subjectId) filter.subjectId = subjectId;
  if (medium) filter.medium = medium;

  const total = await QuestionBank.countDocuments(filter);

  const data = await QuestionBank.find(filter)
    .populate("classId", "class")
    .populate("subjectId", "subject")
    .skip(Number(offset))
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return { total, data };
};

exports.deleteSubQuestion = async (id) => {
  const sub = await SubQuestion.findById(id);
  if (!sub) throw new Error("Subquestion not found");

  await SubQuestion.findByIdAndDelete(id);
  return true;
};


exports.updateStatus =async (id, status) => {
  console.log("ASDFGHGFDSA",status);
  
  if (!['active', 'inactive'].includes(status)) {
    throw new Error('Invalid status');
  }

  const question = await QuestionBank.findById(id);
  if (!question) throw new Error('question not found');

  if (question.status === status) {
    throw new Error(`question is already ${status}`);
  }

  question.status = status;
  await question.save();

  return question;
};




exports.deleteSubject= async (id) => {
    const question = await QuestionBank.findById(id);
    if (!question) throw new Error('question not found');

    if (question.image) {
      const imagePath = path.resolve(question.image);
      fs.unlink(imagePath, err => {
        if (err) console.error('Image delete error:', err.message);
      });
    }

    await QuestionBank.findByIdAndDelete(id);
  };

  exports.deleteMultiple= async (ids) => {
    const questions = await QuestionBank.find({ _id: { $in: ids } });

    for (const question of questions) {
      if (question.image) {
        const imagePath = path.resolve(question.image);
        fs.unlink(imagePath, err => {
          if (err) console.error('Failed to delete image:', err);
        });
      }
    }
await QuestionBank.deleteMany({ _id: { $in: ids } });
  };



  













  
// const QuestionBank = require("../model/questionModel");
// require("../model/classMasterModel");
// require("../model/subjectModel");
// const SubQuestion = require("../model/subQuestionModel");
// const fs = require("fs");
// const path = require("path");

// // ✅ CREATE or UPDATE Question
// exports.createOrUpdateQuestionBank = async (data) => {
//   const {
//     id, mockTestId, classId, subjectId, medium, module,
//     topicName, typeOfQuestion, questionType,
//     questionText, options, correctAnswer
//   } = data;

//   const cleanModule = module.trim();
//   const cleanTopic = topicName.trim();

//   if (id) {
//     const updated = await QuestionBank.findById(id);
//     if (!updated) throw new Error("Question not found");

//     updated.mockTestId = mockTestId;
//     updated.classId = classId;
//     updated.subjectId = subjectId;
//     updated.medium = medium;
//     updated.module = cleanModule;
//     updated.topicName = cleanTopic;
//     updated.typeOfQuestion = typeOfQuestion;
//     updated.questionType = questionType;

//     if (typeOfQuestion === "General") {
//       updated.questionText = questionText.trim();
//       updated.options = options.map(opt => opt.trim());
//       updated.correctAnswer = correctAnswer.trim();
//     } else {
//       updated.questionText = null;
//       updated.options = [];
//       updated.correctAnswer = null;
//     }

//     await updated.save();
//     return updated;
//   }

//   const exists = await QuestionBank.findOne({
//     classId, subjectId, medium,
//     module: cleanModule, topicName: cleanTopic,
//     typeOfQuestion, questionType
//   });
//   if (exists) throw new Error("This Question Bank entry already exists.");

//   const question = new QuestionBank({
//     mockTestId, // ✅ added
//     classId,
//     subjectId,
//     medium,
//     module: cleanModule,
//     topicName: cleanTopic,
//     typeOfQuestion,
//     questionType
//   });

//   if (typeOfQuestion === "General") {
//     if (!questionText || !options || options.length !== 4 || !correctAnswer)
//       throw new Error("General question must have text, 4 options, and correct answer.");

//     question.questionText = questionText.trim();
//     question.options = options.map(opt => opt.trim());
//     question.correctAnswer = correctAnswer.trim();
//   }

//   await question.save();
//   return question;
// };

// // ✅ Add sub-question (for Comprehensive / Poem)
// exports.addSubQuestion = async (data) => {
//   const { parentId, questionText, options, correctAnswer } = data;

//   if (!questionText || options.length !== 4 || !correctAnswer) {
//     throw new Error("Subquestion must have question, 4 options, and correct answer.");
//   }

//   const subQuestion = new SubQuestion({
//     parentId,
//     questionText: questionText.trim(),
//     options: options.map(opt => opt.trim()),
//     correctAnswer: correctAnswer.trim()
//   });

//   await subQuestion.save();
//   return subQuestion;
// };

// // ✅ Get questions with filter
// exports.getFilteredQuestionBank = async (queryParams) => {
//   const { query = "", limit = 10, offset = 0 } = queryParams;
//   const searchRegex = new RegExp(query, "i");

//   const filter = {
//     topicName: { $regex: searchRegex },
//   };

//   const [questions, total] = await Promise.all([
//     QuestionBank.find(filter)
//       .skip(parseInt(offset))
//       .limit(parseInt(limit))
//       .sort({ createdAt: -1 }),
//     QuestionBank.countDocuments(filter),
//   ]);

//   return {
//     total,
//     limit: parseInt(limit),
//     offset: parseInt(offset),
//     questions,
//   };
// };

// // ✅ Get all subquestions of a parent
// exports.getSubQuestions = async (parentId) => {
//   return await SubQuestion.find({ parentId }).sort({ createdAt: -1 });
// };

// // ✅ Delete subquestion
// exports.deleteSubQuestion = async (id) => {
//   const sub = await SubQuestion.findById(id);
//   if (!sub) throw new Error("Subquestion not found");

//   await SubQuestion.findByIdAndDelete(id);
//   return true;
// };

// // ✅ Update active/inactive status
// exports.updateStatus = async (id, status) => {
//   if (!['active', 'inactive'].includes(status)) {
//     throw new Error('Invalid status');
//   }

//   const question = await QuestionBank.findById(id);
//   if (!question) throw new Error('Question not found');

//   if (question.status === status) {
//     throw new Error(`Question is already ${status}`);
//   }

//   question.status = status;
//   await question.save();

//   return question;
// };

// // ✅ Delete one question (and its image if exists)
// exports.deleteSubject = async (id) => {
//   const question = await QuestionBank.findById(id);
//   if (!question) throw new Error('Question not found');

//   if (question.image) {
//     const imagePath = path.resolve(question.image);
//     fs.unlink(imagePath, err => {
//       if (err) console.error('Image delete error:', err.message);
//     });
//   }

//   await QuestionBank.findByIdAndDelete(id);
// };

// // ✅ Delete multiple questions
// exports.deleteMultiple = async (ids) => {
//   const questions = await QuestionBank.find({ _id: { $in: ids } });

//   for (const question of questions) {
//     if (question.image) {
//       const imagePath = path.resolve(question.image);
//       fs.unlink(imagePath, err => {
//         if (err) console.error('Failed to delete image:', err);
//       });
//     }
//   }

//   await QuestionBank.deleteMany({ _id: { $in: ids } });
// };
const Joi = require("joi");

exports.validateMainQuestion = Joi.object({
  id: Joi.string().optional(), 
  classId: Joi.string().required(),
  subjectId: Joi.string().required(),
  medium: Joi.string().required(),
  module: Joi.string().required(),
  topicName: Joi.string().required(),
  typeOfQuestion: Joi.string().valid("General", "Comprehensive", "Poem").required(),
  questionType: Joi.string().valid("Question Bank", "SAT Exam").required(),

  // Required for General, Optional for others
  questionText: Joi.string().required(),

  //  Only for General
  options: Joi.when("typeOfQuestion", {
    is: "General",
    then: Joi.array().items(Joi.string()).length(4).required(),
    otherwise: Joi.forbidden()
  }),
  correctAnswer: Joi.when("typeOfQuestion", {
    is: "General",
    then: Joi.string().required(),
    otherwise: Joi.forbidden()
  }),
  solution: Joi.when("typeOfQuestion", {
  is: "General",
  // then: Joi.string().optional(), // or required if needed
  otherwise: Joi.forbidden()
})
});

exports.validateSubQuestion = Joi.object({
  parentId: Joi.string().required(),
  questionText: Joi.string().required(),
  options: Joi.array().items(Joi.string()).length(4).required(),
  correctAnswer: Joi.string().required()
});




// const Joi = require("joi");

// exports.validateMainQuestion = Joi.object({
//     mockTestId: Joi.string().optional(),
//   id: Joi.string().optional(), 
//   classId: Joi.string().required(),
//   subjectId: Joi.string().required(),
//   medium: Joi.string().required(),
//   module: Joi.string().required(),
//   topicName: Joi.string().required(),
//   typeOfQuestion: Joi.string().valid("General", "Comprehensive", "Poem").required(),
//   questionType: Joi.string().valid("Question Bank", "SAT Exam").required(),

//   // Required for General, Optional for others
//   questionText: Joi.string().required(),

//   //  Only for General
//   options: Joi.when("typeOfQuestion", {
//     is: "General",
//     then: Joi.array().items(Joi.string()).length(4).required(),
//     otherwise: Joi.forbidden()
//   }),
//   correctAnswer: Joi.when("typeOfQuestion", {
//     is: "General",
//     then: Joi.string().required(),
//     otherwise: Joi.forbidden()
//   }),
// });

// exports.validateSubQuestion = Joi.object({
//   parentId: Joi.string().required(),
//   questionText: Joi.string().required(),
//   options: Joi.array().items(Joi.string()).length(4).required(),
//   correctAnswer: Joi.string().required()
// });
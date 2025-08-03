const Joi = require("joi");
const mongoose = require("mongoose");
exports.mockTestValidation = Joi.object({
  id: Joi.string().optional(),
  mockTestName: Joi.string().required(),

  medium: Joi.array()
    .items(Joi.string().valid("Hindi", "English", "Semi-English", "Marathi"))
    .required(),

  class: Joi.array()
    .items(Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }))
    .required(),

  duration: Joi.number().min(5).max(180).required(), //Max 180 minutes
 subjects: Joi.array()
    .items(Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }))
    .required(),
    totalQuestions: Joi.number().min(1).max(100).required(), //  Max 100 que

  status: Joi.string().valid("active", "inactive")
});
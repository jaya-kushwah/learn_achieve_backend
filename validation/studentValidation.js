const Joi = require("joi");

const studentSchema = Joi.object({
  firstName: Joi.string().required(),
  middleName: Joi.string().allow("", null),
  lastName: Joi.string().required(),
  dob: Joi.date().required(),
  gender: Joi.string().valid("Male", "Female", "Other").required(),
  medium: Joi.string().valid("English", "Marathi", "Semi English").required(),
  class: Joi.string().required(),
  schoolName: Joi.string().required(),
  registerBy: Joi.string().required(),
});

module.exports = (req, res, next) => {
  const { error } = studentSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};
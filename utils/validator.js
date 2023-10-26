const Joi = require("joi");

const authSchema = Joi.object({
  username: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
});
const teacherSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  authSchema,
  teacherSchema,
};

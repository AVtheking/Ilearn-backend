const Joi = require("joi");

const authSchema = Joi.object({
  username: Joi.string().lowercase().required().trim(),
  name: Joi.string().required().trim(),
  email: Joi.string().email().required().trim(),

  password: Joi.string().regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@#$!%*?&]{8,}$/
  ),
});
const passwordSchema = Joi.object({
  password: Joi.string().regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@#$!%*?&]{8,}$/
  ),
});
const CategorySchema = Joi.object({
  category: Joi.string().required().trim(),
});
const teacherSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).alphanum().required(),
});

module.exports = {
  authSchema,
  teacherSchema,
  passwordSchema,
  CategorySchema,
};

const Joi = require("joi");

const authSchema = Joi.object({
  username: Joi.string().lowercase().required().trim(),
  name: Joi.string().required().trim(),
  email: Joi.string().email().required().trim().lowercase(),

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
const CourseSchema = Joi.object({
  title: Joi.string().required().trim(),
  description: Joi.string().required().min(10).max(400).trim(),
  thumbnail: Joi.string(),
  category: Joi.string().required(),
  price: Joi.string().default(0),
  duration: Joi.string().default(0),
  rating: Joi.number().default(0),
});
const videoSchema = Joi.object({
  videoTitle: Joi.string().required().trim(),
  videoUrl: Joi.string().required(),
});
module.exports = {
  authSchema,
  passwordSchema,
  CategorySchema,
  CourseSchema,
  videoSchema
};

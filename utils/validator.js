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
  category: Joi.string()
    .valid(
      "Web Development",
      "App Development",
      "DSA",
      "UI/UX",
      "AI/ML",
      "Data Science",
      "AR/VR",
      "Personality Development",
      "Photography",
      "Others"
    )
    .required(),
});
const CourseSchema = Joi.object({
  title: Joi.string().required().trim(),
  description: Joi.string().required().min(10).max(400).trim(),
  thumbnail: Joi.string(),
  category: Joi.string()
    .valid(
      "Web Development",
      "App Development",
      "DSA",
      "UI/UX",
      "AI/ML",
      "Data Science",
      "AR/VR",
      "Personality Development",
      "Photography",
      "Others"
    )
    .required(),
  price: Joi.string().default(0),
  duration: Joi.string().default(0),
  rating: Joi.number().default(0),
});
const videoSchema = Joi.object({
  videoTitle: Joi.string().required().trim(),
  // videoUrl: Joi.string().required(),
});
const courseIdSchema = Joi.object({
  params: Joi.string().required(),
});
const userIdSchema = Joi.object({
  userId: Joi.string().required(),
});
const publishCourseSchema = Joi.object({
  price: Joi.string().required(),
  duration: Joi.number().required(),
  category: Joi.string()
    .valid(
      "Web Development",
      "App Development",
      "DSA",
      "UI/UX",
      "AI/ML",
      "Data Science",
      "AR/VR",
      "Personality Development",
      "Photography",
      "Others"
    )
    .required(),
});
const profileSchema = Joi.object({
  name: Joi.string().required().trim(),
  username: Joi.string().required().trim(),
  domain: Joi.string().trim(),
  bio: Joi.string().trim(),
});
const ratingSchema = Joi.object({
  courseId: Joi.string().required(),
  rating: Joi.string().valid("1", "2", "3", "4", "5").required(),
  comment: Joi.string().trim(),
});
const editReviewSchema = Joi.object({
  courseId: Joi.string().required(),
  reviewId: Joi.string().required(),
  review: Joi.string().required(),
});
const deleteReviewSchema = Joi.object({
  courseId: Joi.string().required(),
  reviewId: Joi.string().required(),
});

module.exports = {
  authSchema,
  passwordSchema,
  CategorySchema,
  CourseSchema,
  videoSchema,
  courseIdSchema,
  publishCourseSchema,
  profileSchema,
  ratingSchema,
  editReviewSchema,
  deleteReviewSchema,
  userIdSchema,
};

const { Course } = require("../models");
const ErrorHandler = require("../middlewares/error");

const courseCtrl = {
  getCourses: async (req, res, next) => {
    try {
      const courses = await Course.find().sort("-createdAt").populate("videos");
      res.json({
        success: true,
        message: "list of all courses",
        data: {
          courses,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getCoursesByCategory: async (req, res, next) => {
    try {
      const category = req.params.category;
      const courses = await Course.find({ category })
        .sort("-createdAt")
        .populate("Video");
      if (!courses) {
        return next(
          new ErrorHandler(400, "No course is available with selected category")
        );
      }
      res.json({
        success: true,
        message: "List of all courses with selected category",
        data: {
          courses,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
module.exports = courseCtrl;

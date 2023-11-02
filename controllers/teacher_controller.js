const { ErrorHandler } = require("../middlewares/error");
const { User, Course, Video } = require("../models");

const teacherCtrl = {
  becomeTeacher: async (req, res, next) => {
    try {
      const { email } = req.body;

      await User.findOneAndUpdate(
        {
          email,
        },
        { role: "teacher" }
      );
      res.json({
        success: "true",
        message: "You have successfully become educator",
      });
    } catch (error) {
      next(error);
    }
  },
  createCourse: async (req, res, next) => {
    try {
      const { title, description, category, price, duration } = req.body;
      const existingTitle = await Course.findOne({ title });
      if (existingTitle) {
        return next(
          new ErrorHandler(400, "Please select different course title")
        );
      }
      let newCourse = new Course({
        title,
        description,
        thumbnail: req.file.filename,
        createdBy: req.user,
        category,
        price,
        duration,
      });

      newCourse = await newCourse.save();
      res.status(201).json({
        success: true,
        message: "New course has been created",
        data: {
          newCourse,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  uploadVideo_toCourse: async (req, res, next) => {
    try {
      const courseId = req.params.courseId;
      const { videoTitle } = req.body;

      let Course = await Course.findById(courseId);
      if (!Course) {
        return next(
          new ErrorHandler(
            400,
            "Some error while creating course.Can't find the course."
          )
        );
      }
      let video = new Video({
        videoTitle,
        videoUrl: req.file.filename,
      });
      Course.videos.push(video._id);
      res.json({
        success: true,
        message: "Video uploaded successfully",
      });
    } catch (e) {
      next(e);
    }
  },
};
module.exports = teacherCtrl;

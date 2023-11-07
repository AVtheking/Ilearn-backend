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
      const { title, description, category, duration } = req.body;
      const existingTitle = await Course.findOne({ title });
      if (existingTitle) {
        return next(
          new ErrorHandler(400, "Please select different course title")
        );
      }
      let newCourse = new Course({
        title,
        description,
        // thumbnail: req.file.filename,
        createdBy: req.user,
        category,

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

      let course = await Course.findById(courseId);
      if (!course) {
        return next(
          new ErrorHandler(
            400,
            "Some error while creating course.Can't find the course."
          )
        );
      }
      let video = new Video({
        videoTitle,
        videoUrl: "public/course_videos" + "/" + req.file.filename,
      });
      video = await video.save();
      course.videos.push(video._id);
      course = await course.save();

      res.json({
        success: true,
        message: "Video uploaded successfully",
      });
    } catch (e) {
      next(e);
    }
  },
  publishCourse: async (req, res, next) => {
    try {
      const courseId = req.params.courseId;
      const { price } = req.body;
      const course = await Course.findByIdAndUpdate(
        courseId,
        { isPublished: true, price },
        { new: true }
      );
      res.json({
        success: true,
        message: "Course published successfully",
        course,
      });
    } catch (e) {
      next(e);
    }
  },

  searchTeacher : async (req, res, next) => {
    try {
      const searchteacher = req.query.q;

      if (!searchteacher) {
        return res.status(400).json({ error: 'Teacher name is required.' });
      }
  
        const teacher = await teacher.find({
        $or: [
          { name: { $regex: new RegExp(searchQuery, 'i') } },
          { expertise: { $regex: new RegExp(searchQuery, 'i') } },
        ],
      });
  
      res.json(teacher);
    } catch (err) {
      next(err);
    }
  },
};
module.exports = teacherCtrl;

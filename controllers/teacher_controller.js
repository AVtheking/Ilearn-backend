const { ErrorHandler } = require("../middlewares/error");
const { User, Course, Video, Category } = require("../models");
const {
  CategorySchema,
  CourseSchema,
  videoSchema,
} = require("../utils/validator");

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
  addCategory: async (req, res, next) => {
    try {
      // const { category } = req.body;
      const result = await CategorySchema.validateAsync(req.body);
      const category = result.category;
      const existingCategory = await Category.findOne({ category });
      if (existingCategory) {
        return next(new ErrorHandler(400, "This Category already exists"));
      }
      let newCategory = new Category({
        name: category,
      });
      newCategory = await newCategory.save();
      res.json({
        success: true,
        message: "A new category has been created",
      });
    } catch (e) {
      next(e);
    }
  },
  createCourse: async (req, res, next) => {
    try {
      // const { title, description, category } = req.body;
      const result = await CourseSchema.validateAsync(req.body);
      const title = result.title;
      const description = result.description;
      const category = result.category;
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
      });

      newCourse = await newCourse.save();

      res.status(201).json({
        success: true,
        message: "New course has been created",
        data: {
          courseId: newCourse._id,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  uploadVideo_toCourse: async (req, res, next) => {
    try {
      const courseId = req.params.courseId;

      const { videoTitle, duration } = req.body;
      const result = await videoSchema.validateAsync({ videoTitle });
      // const videoTitle = result.videoTitle;

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
      const { price, category } = req.body;
      let user = await User.findById(req.user);
      user.createdCourse.push(courseId);
      user.save();
      const result = await CategorySchema.validateAsync({ category });
      const categoryName = result.category;

      const course = await Course.findByIdAndUpdate(
        courseId,
        { isPublished: true, price },
        { new: true }
      );
      let existingCategory = await Category.findOne({ name: categoryName });
      if (!existingCategory) {
        let newCategory = new Category({
          name: category,
          courses: [course._id],
        });
        newCategory.save();
      } else {
        existingCategory.courses.push(course._id);
        existingCategory.save();
      }
      res.json({
        success: true,
        message: "Course published successfully",
        course,
      });
    } catch (e) {
      next(e);
    }
  },
  addlecture: async (req, res, next) => {
    try {
      const courseId = req.params.courseId;

      // const { videoTitle } = req.body;
      const result = await videoSchema.validateAsync(req.body);
      const videoTitle = result.videoTitle;
      let course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(400, "lecture added successfully"));
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
        message: "Lecture added successfully",
      });
    } catch (e) {
      next(e);
    }
  },
  removeLecture: async (req, res, next) => {
    try {
      const courseId = req.params.courseId;
      const lectureId = req.params.lectureId;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(400, "Course not found"));
      }
      const videoIndex = course.videos.indexOf(lectureId);
      if (videoIndex == -1) {
        return next(new ErrorHandler(400, "Lecture not found in the course"));
      }
      course.videos.splice(videoIndex, 1);
      await course.save();
      await Video.findByIdAndRemove(lectureId);
      res.json({
        success: true,
        message: "Lecture removed successfully",
      });
    } catch (e) {
      next(e);
    }
  },
};
module.exports = teacherCtrl;

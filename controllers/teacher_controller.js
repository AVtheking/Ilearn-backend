const { ErrorHandler } = require("../middlewares/error");
const { User, Course, Video, Category } = require("../models");
const { getVideoDurationInSeconds } = require("get-video-duration");
// const Ffmpeg = require("fluent-ffmpeg");
// Ffmpeg.setFfmpegPath("C:ffmpeg\\bin\\ffmpeg.exe");
// Ffmpeg.setFfprobePath("C:ffmpeg\\bin\\ffprobe.exe");
const { scanVideo } = require("ffmpeg-progress");
const mongoose = require("mongoose");

const {
  CategorySchema,
  CourseSchema,
  videoSchema,
  courseIdSchema,
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
  becomeStudent: async (req, res, next) => {
    try {
      const { email } = req.body;
      await User.findOneAndUpdate(
        {
          email,
        },
        { role: "student" }
      );
      res.json({
        success: "true",
        message: "You have successfully became student",
      });
    } catch (e) {
      next(e);
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
      // console.log(req.user);
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
        thumbnail: "public/thumbnails" + "/" + req.file.filename,
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
      const courseid = req.params.courseId;

      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const { videoTitle } = req.body;
      const result2 = await videoSchema.validateAsync({ videoTitle });
      const videotitle = result2.videoTitle;
      // console.log(courseId);

      let course = await Course.findById(courseId);
      if (!course) {
        return next(
          new ErrorHandler(
            400,
            "Some error while creating course.Can't find the course."
          )
        );
      }

      if (course.isPublished) {
        return new ErrorHandler(400, "You can't add video to published course");
      }
      const notesfile = req.files.notes;
      const videofile = req.files.video;
      console.log(notesfile);
      // console.log(file);

      console.log(notesfile[0].filename);
      course.notes.push("public/course_notes" + "/" + notesfile[0].filename);

      const du = await getVideoDurationInSeconds(
        "public/course_videos" + "/" + videofile[0].filename
      );
      console.log(du);
      let video = new Video({
        videoTitle: videotitle,
        videoUrl: "public/course_videos" + "/" + videofile[0].filename,
        videoDuration: du,
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
      const courseid = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const { price, category, duration } = req.body;
      let course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(400, "Course not found"));
      }
      if (course.createdBy != req.user._id) {
        return next(
          new ErrorHandler(400, "You are not the creater of the course")
        );
      }
      if (course.isPublished) {
        return next(new ErrorHandler(400, "Course is already published"));
      }

      let user = req.user;
      user.createdCourse.push(courseId);
      user.save();
      const result2 = await CategorySchema.validateAsync({ category });
      const categoryName = result2.category;
      course.isPublished = true;
      course.price = price;
      course.duration = duration;
      await course.save();

      // const course = await Course.findByIdAndUpdate(
      //   courseId,
      //   { isPublished: true, price },
      //   { new: true }
      // );
      let existingCategory = await Category.findOne({ name: categoryName });
      if (!existingCategory) {
        let newCategory = new Category({
          name: category,
          courses: [courseId],
        });
        newCategory.save();
      } else {
        existingCategory.courses.push(course.Id);
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
  // updateCourse: async (req, res, next) => {
  //   try {
  //     const id = req.params.courseId;
  //     const result = await courseIdSchema.validateAsync({ params: id });
  //     const courseId = result.params;
  //     let course = await Course.findByid(courseId);
  //     if (!course) {
  //       return next(new ErrorHandler(400,"Course not found"))
  //     }
  //   } catch (e) {
  //     next(e);
  //   }
  // },
  deleteCourse: async (req, res, next) => {
    try {
      const params = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params });
      const courseId = result.params;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(404, "Course not found"));
      }
      if (!course.createdBy.equals(req.user._id)) {
        return next(
          new ErrorHandler(400, "You are not the creater of the course")
        );
      }
      for (videos in course.videos) {
        await Video.findByIdAndDelete(videos);
      }
      await Course.findByIdAndDelete(courseId);
      res.json({
        success: true,
        message: "Course deleted successfully",
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
      if (course.createdBy != req.user._id) {
        return next(
          new ErrorHandler(400, "You are not the creater of the course")
        );
      }
      const du = await getVideoDurationInSeconds(
        "public/course_videos" + "/" + req.file.filename
      );
      let video = new Video({
        videoTitle,
        videoUrl: "public/course_videos" + "/" + req.file.filename,
        videoDuration: du,
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
      // console.log(req.user._id);
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(400, "Course not found"));
      }
      // console.log(course.createdBy, req.user._id);
      if (!course.createdBy.equals(req.user._id)) {
        return next(new ErrorHandler(400, "You are not creater of the course"));
      }
      const videoIndex = course.videos.indexOf(lectureId);
      if (videoIndex == -1) {
        return next(new ErrorHandler(400, "Lecture not found in the course"));
      }
      course.videos.splice(videoIndex, 1);
      await course.save();
      await Video.findByIdAndDelete(lectureId);
      res.json({
        success: true,
        message: "Lecture removed successfully",
      });
    } catch (e) {
      next(e);
    }
  },
  searchTeacher: async (req, res, next) => {
    try {
      const searchteacher = req.query.q;

      if (!searchteacher) {
        return res.status(400).json({ error: "Teacher name is required." });
      }

      const teacher = await teacher.find({
        $or: [
          { name: { $regex: new RegExp(searchQuery, "i") } },
          { expertise: { $regex: new RegExp(searchQuery, "i") } }, //what is this?
        ],
      });

      res.json(teacher);
    } catch (err) {
      next(err);
    }
  },
};
module.exports = teacherCtrl;

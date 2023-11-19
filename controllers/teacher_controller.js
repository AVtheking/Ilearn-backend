const { ErrorHandler } = require("../middlewares/error");
const { User, Course, Video, Category } = require("../models");
const { getVideoDurationInSeconds } = require("get-video-duration");
const fs = require("fs");

const path = require("path");

const {
  CourseSchema,
  videoSchema,
  courseIdSchema,
  publishCourseSchema,
} = require("../utils/validator");

const createConversionWorker = require("../utils/videoConverter");
const resolutions = [
  { name: "144p", width: 256, height: 144 },
  { name: "360p", width: 640, height: 360 },
  { name: "720p", width: 1280, height: 720 },
];

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
  getCreatedCourses: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pagesize);
      const skip = (page - 1) * pageSize;
      const totalCourses = await Course.countDocuments({
        createdBy: req.user._id,
      });
      const totalPages = Math.ceil(totalCourses / pageSize);
      const courses = await Course.aggregate([
        {
          $match: { createdBy: req.user._id },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
        {
          $project: {
            title: 1,
            description: 1,
            thumbnail: 1,
            price: 1,
            duration: 1,
            rating: 1,
            category: 1,

            createdAt: 1,
            updatedAt: 1,
            totalStudents: 1,
          },
        },
      ]);
      res.json({
        success: true,
        message: "Courses fetched successfully",
        data: {
          courses,
          totalCourses,
          totalPages,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  // addCategory: async (req, res, next) => {
  //   try {

  //     const result = await CategorySchema.validateAsync(req.body);
  //     const category = result.category;
  //     const existingCategory = await Category.findOne({ category });
  //     if (existingCategory) {
  //       return next(new ErrorHandler(400, "This Category already exists"));
  //     }
  //     let newCategory = new Category({
  //       name: category,
  //     });
  //     newCategory = await newCategory.save();
  //     res.json({
  //       success: true,
  //       message: "A new category has been created",
  //     });
  //   } catch (e) {
  //     next(e);
  //   }
  // },
  createCourse: async (req, res, next) => {
    try {
      const result = await CourseSchema.validateAsync(req.body);
      const { title, description, category } = result;

      const existingTitle = await Course.findOne({ title });
      if (existingTitle) {
        return next(
          new ErrorHandler(400, "Please select different course title")
        );
      }

      let newCourse = new Course({
        title,
        description,
        thumbnail: "thumbnail" + "/" + req.file.filename,
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
    let noteFilePath, videoFilePath, inputFilePath, inputFileName;
    try {
      const courseid = req.params.courseId;
      // console.log(courseid);

      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const { videoTitle } = req.body;
      const result2 = await videoSchema.validateAsync({ videoTitle });
      const videotitle = result2.videoTitle;

      let course = await Course.findById(courseId);

      if (!course) {
        return next(
          new ErrorHandler(
            400,
            "Some error while creating course.Can't find the course."
          )
        );
      }

      if (!course.createdBy.equals(req.user._id)) {
        return next(new ErrorHandler(400, "You are not the creater of course"));
      }
      if (course.isPublished) {
        return next(new ErrorHandler(400, "Course is already published"));
      }

      const notesfile = req.files.notes;
      const videofile = req.files.video;

      noteFilePath = "public/course_notes" + "/" + notesfile[0].filename;
      videoFilePath = "public/course_videos" + "/" + videofile[0].filename;

      course.notes.push(noteFilePath);

      //Video Conversion using worker threads
      const conversionPromise = resolutions.map((resolution) => {
        inputFilePath = videoFilePath;
        inputFileName = path.basename(
          inputFilePath,
          path.extname(inputFilePath)
        );

        const outputPath = `public/course_videos/${inputFileName}-${
          resolution.name
        }${path.extname(inputFilePath)}`;
        return createConversionWorker(resolution, inputFilePath, outputPath);
      });
      await Promise.all(conversionPromise);
      console.log("Video conversion completed");

      //calculate video duration
      const du = await getVideoDurationInSeconds(videoFilePath);

      let video = new Video({
        videoTitle: videotitle,
        videoUrl: videoFilePath,
        videoUrl_144p: `public/course_videos/${inputFileName}-144p${path.extname(
          inputFilePath
        )}`,
        videoUrl_360p: `public/course_videos/${inputFileName}-360p${path.extname(
          inputFilePath
        )}`,
        videoUrl_720p: `public/course_videos/${inputFileName}-720p${path.extname(
          inputFilePath
        )}`,
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
      if (noteFilePath) {
        fs.unlinkSync(noteFilePath);
        console.log("note file deleted");
      }
      if (videoFilePath) {
        fs.unlinkSync(videoFilePath);
      }

      next(e);
    }
  },

  publishCourse: async (req, res, next) => {
    try {
      const courseid = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;

      const result2 = await publishCourseSchema.validateAsync(req.body);
      const { price, duration, category } = result2;
      let course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(400, "Course not found"));
      }
      if (!course.createdBy.equals(req.user._id)) {
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

      course.isPublished = true;
      course.price = price;
      course.duration = duration;
      course.preview=courses.videos[0];
      await course.save();

      let existingCategory = await Category.findOne({ name: category });
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
  updateCourse: async (req, res, next) => {
    try {
      const id = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params: id });
      const courseId = result.params;

      const result2 = await CourseSchema.validateAsync(req.body);
      const { title, description, category } = result2;
      let existingtitle = await Course.findOne({ title });
      if (existingtitle) {
        return next(
          new ErrorHandler(400, "Please select different course title")
        );
      }
      await Course.findByIdAndUpdate(courseId, {
        title,
        description,
        category,
      });
      res.json({
        success: true,
        message: "Course updated successfully",
      });
    } catch (e) {
      next(e);
    }
  },
  changeThumbnail: async (req, res, next) => {
    try {
      const courseid = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      let course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(404, "Course not found"));
      }
      if (!course.createdBy.equals(req.user._id)) {
        return next(new ErrorHandler(401, "You are not the creater of course"));
      }
      if (!req.file) {
        return next(new ErrorHandler(400, "Please upload a file"));
      }
      fs.unlinkSync(course.thumbnail);
      course.thumbnail = "thumbnail" + "/" + req.file.filename;
      // await Course.findByIdAndUpdate(courseId, {
      //   thumbnail: "public/thumbnail" + "/" + req.file.filename,
      // });
      await course.save();
      res.json({
        success: true,
        message: "Thumbnail changed successfully",
      });
    } catch (e) {
      next(e);
    }
  },
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
      const courseIndex = req.user.createdCourse.indexOf(courseId);
      req.user.createdCourse.splice(courseIndex, 1);
      await req.user.save();
      fs.unlinkSync(course.thumbnail);
      for (const videoId of course.videos) {
        const video = await Video.findById(videoId);

        if (video) {
          await Video.findByIdAndDelete(videoId);
          fs.unlinkSync(video.videoUrl);
          fs.unlinkSync(video.videoUrl_144p);
          fs.unlinkSync(video.videoUrl_360p);
          fs.unlinkSync(video.videoUrl_720p);
        }
      }
      for (const note of course.notes) {
        fs.unlinkSync(note);
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
    let videoFilePath, inputFilePath, inputFileName;
    try {
      const courseId = req.params.courseId;

      const result = await videoSchema.validateAsync(req.body);
      const videoTitle = result.videoTitle;
      let course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(404, "Course not found"));
      }
      if (!course.createdBy.equals(req.user._id)) {
        return next(
          new ErrorHandler(400, "You are not the creater of the course")
        );
      }
      videoFilePath = "public/course_videos" + "/" + req.file.filename;
      const conversionPromise = resolutions.map((resolution) => {
        inputFilePath = videoFilePath;
        inputFileName = path.basename(
          inputFilePath,
          path.extname(inputFilePath)
        );
        const outputPath = `public/course_videos/${inputFileName}-${
          resolution.name
        }${path.extname(inputFilePath)}`;
        return createConversionWorker(resolution, inputFilePath, outputPath);
      });
      await Promise.all(conversionPromise);
      console.log("Video conversion completed");
      const du = await getVideoDurationInSeconds(videoFilePath);
      let video = new Video({
        videoTitle,
        videoUrl: videoFilePath,
        videoUrl_144p: `public/course_videos/${inputFileName}-144p${path.extname(
          inputFilePath
        )}`,
        videoUrl_360p: `public/course_videos/${inputFileName}-360p${path.extname(
          inputFilePath
        )}`,
        videoUrl_720p: `public/course_videos/${inputFileName}-720p${path.extname(
          inputFilePath
        )}`,
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

      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(400, "Course not found"));
      }

      if (!course.createdBy.equals(req.user._id)) {
        return next(new ErrorHandler(400, "You are not creater of the course"));
      }
      const videoIndex = course.videos.indexOf(lectureId);
      if (videoIndex == -1) {
        return next(new ErrorHandler(400, "Lecture not found in the course"));
      }

      const video = await Video.findById(lectureId);

      if (video) {
        await course.videos.splice(videoIndex, 1);
        await course.save();

        await Video.findByIdAndDelete(lectureId);
        fs.unlinkSync(video.videoUrl);
        fs.unlinkSync(video.videoUrl_144p);
        fs.unlinkSync(video.videoUrl_360p);
        fs.unlinkSync(video.videoUrl_720p);
      }

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
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pagesize);
      const skip = (page - 1) * pageSize;
      const query = req.query.teacher;
      // console.log(query);
      const teachers = await User.aggregate([
        {
          $search: {
            text: {
              path: "username",
              query: query,
              fuzzy: {},
            },
          },
        },
        {
          $facet: {
            searchResults: [
              { $skip: skip },
              { $limit: pageSize },
              {
                $project: {
                  _id: 1,
                  username: 1,
                  profileimg: 1,
                },
              },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ]);
      const searchResults = teachers[0].searchResults;
      const totalCount = teachers[0].totalCount[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      res.json({
        success: true,
        message: "Teachers found",
        data: {
          teachers: searchResults,
          totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
module.exports = teacherCtrl;

const { ErrorHandler } = require("../middlewares/error");
const { User, Course, Video, Category } = require("../models");
const { getVideoDurationInSeconds } = require("get-video-duration");
const fs = require("fs");
const Queue = require("bull");

const redisConfig = {
  host: "127.0.0.1",
  port: 6379,
};
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
      const user = req.user;

      await User.findByIdAndUpdate(user._id, { role: "teacher" });

      res.json({
        success: "true",
        message: "You have successfully become educator",
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  becomeStudent: async (req, res, next) => {
    try {
      const user = req.user;
      await User.findOneAndUpdate(user._id, { role: "student" });
      res.json({
        success: "true",
        message: "You have successfully became student",
        data: {
          user,
        },
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

  createCourse: async (req, res, next) => {
    try {
      const result = await CourseSchema.validateAsync(req.body);
      const { title, description, category } = result;
      if (!req.file) {
        return next(new ErrorHandler(400, "Please upload a thumbnail file"));
      }
      const existingTitle = await Course.findOne({ title });
      if (existingTitle) {
        fs.unlinkSync("public/thumbnail" + "/" + req.file.filename);
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
      fs.unlinkSync("public/thumbnail" + "/" + req.file.filename);
      next(e);
    }
  },

  uploadVideo_toCourse: async (req, res, next) => {
    let noteFilePath = null,
      videoFilePath,
      inputFilePath,
      inputFileName;
    let videoConversionQueue;
    try {
      const courseid = req.params.courseId;

      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const { videoTitle } = req.body;
      const result2 = await videoSchema.validateAsync({ videoTitle });
      const videotitle = result2.videoTitle;
      const notesfile = req.files.notes;
      const videofile = req.files.video;
      // videoConversionQueue = new Queue("videoConversion", {
      //   redis: redisConfig,
      //   limiter: {
      //     max: 1,
      //     duration: 1000,
      //   },
      //   concurrency: 2,
      // });

      let course = await Course.findById(courseId);
      if (notesfile) {
        noteFilePath = "public/course_notes" + "/" + notesfile[0].filename;
      }
      if (!videofile) {
        return next(new ErrorHandler(400, "Please upload a video file"));
      }
      videoFilePath = "public/course_videos" + "/" + videofile[0].filename;

      if (!course) {
        if (noteFilePath != null) {
          fs.unlinkSync(noteFilePath);
        }
        fs.unlinkSync(videoFilePath);
        return next(
          new ErrorHandler(
            400,
            "Some error while creating course.Can't find the course."
          )
        );
      }

      if (!course.createdBy.equals(req.user._id)) {
        if (noteFilePath != null) {
          fs.unlinkSync(noteFilePath);
        }
        fs.unlinkSync(videoFilePath);
        return next(new ErrorHandler(400, "You are not the creater of course"));
      }

      inputFilePath = videoFilePath;
      inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));

      const du = await getVideoDurationInSeconds(videoFilePath);
      course.duration += du;

      let video = new Video({
        videoTitle: videotitle,
        videoUrl: videoFilePath,
        // videoUrl_144p: `public/course_videos/${inputFileName}-144p${path.extname(
        //   inputFilePath
        // )}`,
        // videoUrl_360p: `public/course_videos/${inputFileName}-360p${path.extname(
        //   inputFilePath
        // )}`,
        // videoUrl_720p: `public/course_videos/${inputFileName}-720p${path.extname(
        //   inputFilePath
        // )}`,
        videoDuration: du,
      });
      video = await video.save();

      await course.videos.push({
        video: video._id,
        note: noteFilePath,
      });

      //   const coursess = await Course.findById(courseId);
      //   await coursess.videos.push({
      //     video: video._id,
      //     note: noteFilePath,
      //   });

      //   coursess = await coursess.save();
      await course.save();
      // await videoConversionQueue.add({
      //   resolutions,
      //   inputFilePath,

      //   videoFilePath,
      //   videotitle,
      //   inputFileName,
      //   noteFilePath,
      //   courseId,
      //   du,
      // });
      res.json({
        success: true,
        message: "Video uploaded successfully",
        data: {
          duration: course.duration,
        },
      });
      //Video Conversion using worker threads
      // const conversionPromise = resolutions.map((resolution) => {
      //   inputFilePath = videoFilePath;
      //   inputFileName = path.basename(
      //     inputFilePath,
      //     path.extname(inputFilePath)
      //   );

      //   const outputPath = `public/course_videos/${inputFileName}-${
      //     resolution.name
      //   }${path.extname(inputFilePath)}`;
      //   const conversionData = {
      //     resolution,
      //     inputFilePath,
      //     outputPath,
      //   };
      //   return videoConversionQueue.add(conversionData);
      //   // return createConversionWorker(resolution, inputFilePath, outputPath);
      // });
      // await Promise.all(conversionPromise);

      // videoConversionQueue.process(async (job) => {
      //   const {
      //     resolutions,
      //     inputFilePath,
      //     videoFilePath,
      //     videotitle,
      //     inputFileName,
      //     noteFilePath,
      //     courseId,
      //     du,
      //   } = job.data;
      //   console.log(`Processing video conversion for resolution`);

      //   const conversionPromise = resolutions.map((resolution) => {
      //     const outputPath = `public/course_videos/${inputFileName}-${
      //       resolution.name
      //     }${path.extname(inputFilePath)}`;
      //     return createConversionWorker(resolution, inputFilePath, outputPath);

      //   });
      //   await Promise.all(conversionPromise);

      //   console.log("Video conversion completed");

      //   return { status: "completed" };

      //   .3
      // });
    } catch (e) {
      if (noteFilePath) {
        fs.unlinkSync(noteFilePath);
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
      if (course.videos.length == 0) {
        return next(new ErrorHandler(400, "Please upload some videos"));
      }
      let user = req.user;
      if (!user.is_certified_educator) {
        if (price != 0) {
          return next(
            new ErrorHandler(
              400,
              "You are not a certified educator. You can't publish paid course"
            )
          );
        }
      }
      user.createdCourse.push(courseId);
      user.save();

      course.isPublished = true;
      course.price = price.toString();
      course.duration = duration;
      course.preview = course.videos[0] ? course.videos[0].video : null;
      await course.save();

      let existingCategory = await Category.findOne({ name: category });
      if (!existingCategory) {
        let newCategory = new Category({
          name: category,
          courses: [courseId],
        });
        await newCategory.save();
      } else {
        existingCategory.courses.push(course._id);
        await existingCategory.save();
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
      if (fs.existsSync("public" + "/" + course.thumbnail)) {
        fs.unlinkSync("public/thumbnail" + "/" + req.file.filename);
      }
      course.thumbnail = "thumbnail" + "/" + req.file.filename;

      await course.save();
      res.json({
        success: true,
        message: "Thumbnail changed successfully",
      });
    } catch (e) {
      fs.unlinkSync("public/thumbnail" + "/" + req.file.filename);
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

      const category = await Category.findOne({ name: course.category });
      const catCourseIndex = category.courses.indexOf(courseId);
      if (catCourseIndex != -1) {
        category.courses.splice(catCourseIndex, 1);
        await category.save();
      }

      const courseIndex = req.user.createdCourse.indexOf(courseId);
      req.user.createdCourse.splice(courseIndex, 1);
      await req.user.save();
      if (fs.existsSync("public" + "/" + course.thumbnail)) {
        fs.unlinkSync("public" + "/" + course.thumbnail);
      }
      for (const videoId of course.videos) {
        const video = await Video.findById(videoId.video);

        if (video) {
          await Video.findByIdAndDelete(videoId.video);
          if (fs.existsSync(video.videoUrl)) {
            fs.unlinkSync(video.videoUrl);
          }
          // if (fs.existsSync(video.videoUrl_144p)) {
          //   fs.unlinkSync(video.videoUrl_144p);
          // }
          // if (fs.existsSync(video.videoUrl_360p)) {
          //   fs.unlinkSync(video.videoUrl_360p);
          // }
          // if (fs.existsSync(video.videoUrl_720p)) {
          //   fs.unlinkSync(video.videoUrl_720p);
          // }
        }
      }
      for (const notes of course.videos) {
        if (notes.note == null) {
          continue;
        }
        if (fs.existsSync(notes.note)) {
          fs.unlinkSync(notes.note);
        }
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
      const videoIndex = course.videos.findIndex((video) => {
        return video.video.equals(lectureId);
      });
      if (videoIndex == -1) {
        return next(new ErrorHandler(400, "Lecture not found in the course"));
      }
      const note = course.videos[videoIndex].note;
      if (note != null) {
        if (fs.existsSync(note)) {
          fs.unlinkSync(note);
        }
      }
      const video = await Video.findById(lectureId);

      if (video) {
        await Course.findByIdAndUpdate(courseId, {
          $pull: { videos: { video: lectureId } },
        });

        if (fs.existsSync(video.videoUrl)) {
          fs.unlinkSync(video.videoUrl);
        }
        // if (fs.existsSync(video.videoUrl_144p)) {
        //   fs.unlinkSync(video.videoUrl_144p);
        // }
        // if (fs.existsSync(video.videoUrl_360p)) {
        //   fs.unlinkSync(video.videoUrl_360p);
        // }
        // if (fs.existsSync(video.videoUrl_720p)) {
        //   fs.unlinkSync(video.videoUrl_720p);
        // }
        await Video.findByIdAndDelete(lectureId);
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

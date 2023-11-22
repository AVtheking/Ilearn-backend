const { ErrorHandler } = require("../middlewares/error");
const fs = require("fs");
const { Course } = require("../models");
const { courseIdSchema } = require("../utils/validator");

const videoCtrl = {
  streamVideo: async (req, res, next) => {
    try {
      const id = req.params.courseId;
      const lectureId = req.params.lectureId;
      const result = await courseIdSchema.validateAsync({ params: id });
      const courseId = result.params;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(400, "No course found"));
      }
      const user = req.user;
      const courseIdIndex = user.ownedCourse.findIndex((course) =>
        course.courseId.equals(courseId)
      );
      if (courseIdIndex == -1 && course.preview[0] != lectureId) {
        return next(
          new ErrorHandler(400, "You have not enrolled in this course")
        );
      }
      const range = req.headers.range;
      if (!range) {
        return next(new ErrorHandler(400, "Required range header"));
      }
      const videoPath = req.query.path;
      const videoSize = fs.statSync(videoPath).size;
      const CHUNK_SIZE = 10 ** 6;
      const start = Number(range.replace(/\D/g, ""));
      const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
      if (end == videoSize - 1) {
        const completedVideoIndex =
          user.ownedCourse[courseIdIndex].completedVideo.indexOf(lectureId);
        if (completedVideoIndex == -1) {
          user.ownedCourse[courseIdIndex].completedVideo.push(lectureId);
          // await user.save();
        }
      }
      if (
        user.ownedCourse[courseIdIndex].completedVideo.length ==
        course.videos.length
      ) {
        const completedCourseIndex = user.completedCourse.indexOf(courseId);
        if (completedCourseIndex == -1) {
          user.completedCourse.push(courseId);
        }
      }
      await user.save();
      const contentLength = end - start + 1;
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Range": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, headers);
      const videostream = fs.createReadStream(videoPath, { start, end });
      videostream.pipe(res);
    } catch (e) {
      next(e);
    }
  },
};
module.exports = videoCtrl;

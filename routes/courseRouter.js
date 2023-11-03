const express = require("express");
const { auth } = require("../middlewares");
const { courseCtrl, videoCtrl } = require("../controllers");
const courseRouter = express.Router();

courseRouter.get("/getCourse", auth, courseCtrl.getCourses);
courseRouter.get(
  "/getCourseBycategory/:category",
  auth,
  courseCtrl.getCoursesByCategory
);
module.exports = courseRouter;
courseRouter.get("/video/:courseId",  videoCtrl.streamVideo);

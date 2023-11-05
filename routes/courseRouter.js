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
courseRouter.get("/video/:courseId", videoCtrl.streamVideo);
courseRouter.get("/getCategoriesName", auth, courseCtrl.getCategoriesName);
courseRouter.get("/getCategoriesData", auth, courseCtrl.getCategoriesData);
module.exports = courseRouter;

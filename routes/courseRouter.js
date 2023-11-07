const express = require("express");
const { auth } = require("../middlewares");
const { courseCtrl, videoCtrl } = require("../controllers");
const courseRouter = express.Router();

courseRouter.get("/getCourse",auth, courseCtrl.getCourses);
courseRouter.get(
  "/getCourseBycategory/:category",
  auth,
  courseCtrl.getCoursesByCategory
);
courseRouter.get("/video/:courseId",  videoCtrl.streamVideo);
module.exports = courseRouter;
courseRouter.get("/search-course", courseCtrl.searchCourses);
courseRouter.get("/getpopularcourse", courseCtrl.getPopularCourses);
courseRouter.post("/rate-course",auth,courseCtrl.rateCourse );
courseRouter.post('/enroll/:courseId', auth, courseCtrl.enrollCourse);

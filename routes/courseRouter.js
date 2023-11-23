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
courseRouter.get("/getCourseById/:courseId", auth, courseCtrl.getCourseByid);
courseRouter.get("/video/:courseId/lecture/:lectureId", auth,videoCtrl.streamVideo);
courseRouter.get("/getCategoriesName", auth, courseCtrl.getCategoriesName);
courseRouter.get("/getCategoriesData", auth, courseCtrl.getCategoriesData);
courseRouter.get("/get-reviews/:courseId", auth, courseCtrl.getReviews);
courseRouter.get("/get-popular-course", auth, courseCtrl.getPopularCourses);

courseRouter.get("/search-course", courseCtrl.searchCourses);
courseRouter.get("/get-popular-course", courseCtrl.getPopularCourses);
courseRouter.get("/download-notes/:courseId", auth, courseCtrl.downloadNotes);
courseRouter.get(
  "/download-video/:courseId/lecture/:lectureId",
  auth,
  courseCtrl.downloadVideo
);

courseRouter.post("/rate-course", auth, courseCtrl.rateCourse);

courseRouter.patch("/edit-Review/", auth, courseCtrl.editReview);

courseRouter.delete("/delete-Review/", auth, courseCtrl.deleteReview);

module.exports = courseRouter;

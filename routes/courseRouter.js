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
courseRouter.get("/video/:courseId", auth, videoCtrl.streamVideo);
courseRouter.get("/getCategoriesName", auth, courseCtrl.getCategoriesName);
courseRouter.get("/getCategoriesData", auth, courseCtrl.getCategoriesData);
courseRouter.get("/get-cart", auth, courseCtrl.getCoursesInCart);
courseRouter.get("/get-wishlist", auth, courseCtrl.getWishlist);
courseRouter.post("/add-cart/:courseId", auth, courseCtrl.addCourseToCart);
courseRouter.post("/add-wishlist", auth, courseCtrl.addToWishlist);
courseRouter.delete(
  "/delete-cart/:courseId",
  auth,
  courseCtrl.deleteCourseFromCart
);
courseRouter.delete(
  "/delete-wishlist",
  auth,
  courseCtrl.deleteCourseFromWishlist
);
courseRouter.patch("/change-description", auth);
courseRouter.get("/search-course", courseCtrl.searchCourses);
courseRouter.get("/getpopularcourse", courseCtrl.getPopularCourses);
courseRouter.post("/rate-course", auth, courseCtrl.rateCourse);
courseRouter.post("/enroll/:courseId", auth, courseCtrl.enrollCourse);
module.exports = courseRouter;

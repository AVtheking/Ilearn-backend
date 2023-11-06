const express = require("express");
const { auth } = require("../middlewares");
const { courseCtrl, videoCtrl } = require("../controllers");
const courseRouter = express.Router();

courseRouter.get("/getCourse", auth, courseCtrl.getCourses);
courseRouter.get("/getCourseBycategory/:category",auth,courseCtrl.getCoursesByCategory);
courseRouter.get("/video/:courseId", videoCtrl.streamVideo);
courseRouter.get("/getCategoriesName", auth, courseCtrl.getCategoriesName);
courseRouter.get("/getCategoriesData", auth, courseCtrl.getCategoriesData);
courseRouter.get("/getCart", auth, courseCtrl.getCoursesInCart);
courseRouter.get("/get-wishlist", auth, courseCtrl.getWishlist)
courseRouter.post("/add-cart/:courseId", auth, courseCtrl.addCourseToCart);
courseRouter.post("/add-wishlist", auth, courseCtrl.addToWishlist)
courseRouter.delete("/delete-cart/:courseId", auth, courseCtrl.deleteCourseFromCart);
courseRouter.delete("/delete-wishlist",auth,courseCtrl.deleteCourseFromWishlist)
module.exports = courseRouter;

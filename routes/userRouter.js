const express = require('express');
const userRouter = express.Router();  

const { userCtrl } = require('../controllers');
const { uploadImage, auth } = require('../middlewares');

userRouter.get("/get-cart", auth, userCtrl.getCoursesInCart);
userRouter.get("/get-wishlist", auth, userCtrl.getWishlist);
userRouter.get("/search-user", userCtrl.searchUser); 
userRouter.get("/completed-course", auth, userCtrl.getCompletedCourse);

userRouter.post("/add-cart/:courseId", auth, userCtrl.addCourseToCart);
userRouter.post("/add-wishlist", auth, userCtrl.addToWishlist);

userRouter.delete(  "/delete-cart/:courseId",auth,userCtrl.deleteCourseFromCart);
userRouter.delete("/delete-wishlist", auth, userCtrl.deleteCourseFromWishlist);

userRouter.patch('/update-profileImg', auth, uploadImage, userCtrl.uploadProfilePicture);
userRouter.patch('/update-profile', auth, userCtrl.updateProfile);

module.exports = userRouter;
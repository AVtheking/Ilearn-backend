const { ErrorHandler } = require("../middlewares/error");
const { User, Course } = require("../models");
const fs = require("fs");
const {
  profileSchema,
  courseIdSchema,
  userIdSchema,
} = require("../utils/validator");

const userCtrl = {
  uploadProfilePicture: async (req, res, next) => {
    try {
      if (!req.file) return next(new ErrorHandler(400, "Please upload a file"));
      const user = req.user;
      if (user.profileimg != null) {
        if (fs.existsSync("public" + "/" + user.profileimg)) {
          fs.unlinkSync("public" + "/" + user.profileimg);
        }
      }
      user.profileimg = `thumbnail` + "/" + req.file.filename;
      await user.save();
      res.json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: {
          profileimg: user.profileimg,
        },
      });
    } catch (error) {
      fs.unlinkSync("public/thumbnail" + "/" + req.file.filename);
      next(error);
    }
  },
  deleteProfilePicture: async (req, res, next) => {
    try {
      const user = req.user;
      const path = user.profileimg;
      user.profileimg = null;
      await user.save();
      if (path != null) {
        if (fs.existsSync("public" + "/" + path)) {
          fs.unlinkSync("public" + "/" + path);
        }
      }
      res.json({
        success: true,
        message: "Profile picture deleted successfully",
        data: {
          user,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const result = await profileSchema.validateAsync(req.body);
      const { name, username, domain, bio } = result;
      const user = await User.findOne({ username });
      if (user && user.id != req.user._id) {
        return res.status(400).json({ message: "Username already taken" });
      }
      await User.findByIdAndUpdate(req.user._id, {
        name,
        username,
        domain,
        bio,
      });
      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          name,
          username,
          domain,
          bio,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  addCourseToCart: async (req, res, next) => {
    try {
      const courseid = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const user = req.user;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(404, "No course found"));
      }
      if (!course.isPublished) {
        return next(new ErrorHandler(400, "Course is not published yet"));
      }
      const courseIndex = user.cart.indexOf(courseId);
      if (courseIndex != -1) {
        return next(new ErrorHandler(400, "Course already in cart"));
      }
      const courseIdIndex = user.ownedCourse.findIndex((course) =>
        course.courseId.equals(courseId)
      );
      if (courseIdIndex != -1) {
        return next(
          new ErrorHandler(400, "You have already enrolled in this course")
        );
      }
      user.cart.push(courseId);
      await user.save();
      res.json({
        success: true,
        message: "Course added to cart successfully",
      });
    } catch (e) {
      next(e);
    }
  },
  deleteCourseFromCart: async (req, res, next) => {
    try {
      const courseid = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const user = req.user;
      const courseIndex = user.cart.indexOf(courseId);
      if (courseIndex == -1) {
        return next(new ErrorHandler(404, "No course found"));
      }
      user.cart.splice(courseIndex, 1);
      await user.save();
      res.json({
        success: true,
        message: "Course removed from cart successfully",
      });
    } catch (e) {
      next(e);
    }
  },
  getCoursesInCart: async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate({
        path: "cart",
        select:
          "_id title description thumbnail category price rating duration ",
      });
      res.json({
        success: true,
        message: "Courses in the cart ",
        data: {
          courses: user.cart,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getWishlist: async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate({
        path: "wishlist",
        select:
          "_id title description thumbnail category price rating duration ",
      });

      res.json({
        success: true,
        message: "wishlist of the user",
        data: {
          wishlist: user.wishlist,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  addToWishlist: async (req, res, next) => {
    try {
      const user = req.user;
      const courseid = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(404, "No course found"));
      }
      if (!course.isPublished) {
        return next(new ErrorHandler(400, "Course is not published yet"));
      }
      const courseIdIndex = user.wishlist.indexOf(courseId);
      if (courseIdIndex != -1) {
        return next(new ErrorHandler(400, "Course already in wishlist"));
      }
      user.wishlist.push(courseId);
      await user.save();
      res.json({
        success: true,
        message: "course added to wishlist",
        data: {
          wishlist: user.wishlist,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  deleteCourseFromWishlist: async (req, res, next) => {
    try {
      const courseid = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const user = req.user;
      const courseIndex = user.wishlist.indexOf(courseId);
      if (courseIndex == -1) {
        return next(new ErrorHandler(404, "No course found"));
      }
      user.wishlist.splice(courseIndex, 1);
      await user.save();
      res.json({
        success: true,
        message: "Course deleted from wishlist successfully",
      });
    } catch (e) {
      next(e);
    }
  },
  searchUser: async (req, res, next) => {
    try {
      const searchquery = req.query.username;
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pageSize);
      const startIndex = (page - 1) * pageSize;

      const user = await User.aggreagate([
        {
          $search: {
            text: {
              path: "username",
              query: searchquery,
              fuzzy: {},
            },
          },
        },
        {
          $skip: startIndex,
        },
        {
          $limit: pageSize,
        },
        {
          $project: {
            username: 1,
            name: 1,
            profileimg: 1,
          },
        },
      ]);
      res.json({
        success: true,
        message: "search results",
        data: {
          user,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  //   addToOC: async (req, res, next) => {
  //     const courseId = req.params.courseId;
  //     const lectureId = req.params.lectureId;
  //     const courseIndex = user.ownedCourse.findIndex((course) =>
  //       course.courseId.equals(courseId)
  //     );

  //     const user = await User.findById(req.user._id);
  //     if (courseIndex == -1) {
  //       user.ownedCourse.push({
  //         courseId: courseId,
  //         completedVideo: [],
  //       });
  //     }
  //     await user.save();
  //     res.json({
  //       success: true,
  //       message: "Course added to owned courses",
  //     });
  //   },
  //   addlecture: async (req, res, next) => {
  //     const lectureId = req.params.lectureId;
  //     const courseId = req.params.courseId;
  //     const user = req.user;
  //     const courseIndex = user.ownedCourse.findIndex((course) =>
  //       course.courseId.equals(courseId)
  //     );
  //     if (courseIndex != -1) {
  //       const completedVideoIndex =
  //         user.ownedCourse[courseIndex].completedVideo.indexOf(lectureId);
  //       if (completedVideoIndex == -1) {
  //         user.ownedCourse[courseIndex].completedVideo.push(lectureId);
  //       }
  //     }
  //     await user.save();
  //     res.json({
  //       message: "lecture added to owned courses",
  //       data: {
  //         completedVideo: user.ownedCourse[courseIndex].completedVideo,
  //       },
  //     });
  //   },
  getCompletedCourse: async (req, res, next) => {
    try {
      //   const user = req.user;
      const user = await User.findById(req.user._id).populate({
        path: "completedCourse",
        select:
          "_id title description thumbnail category price rating duration",
      });
      res.json({
        success: true,
        message: "completed courses",
        data: {
          completedCourse: user.completedCourse,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getOwnedCourses: async (req, res, next) => {
    try {
      const user = await User.aggregate([
        {
          $match: { _id: req.user._id },
        },
        { $unwind: "$ownedCourse" },
        {
          $lookup: {
            from: "courses",
            localField: "ownedCourse.courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        {
          $lookup: {
            from: "videos",
            localField: "course.videos.video",
            foreignField: "_id",
            as: "video",
          },
        },
        {
          $unwind: "$course",
        },
        {
          $project: {
            _id: 0,
            courseid: "$course._id",
            title: "$course.title",
            description: "$course.description",
            thumbnail: "$course.thumbnail",
            category: "$course.category",
            price: "$course.price",
            rating: "$course.rating",
            duration: "$course.duration",
            completedVideo: { $size: "$ownedCourse.completedVideo" },
            totalVideos: { $size: "$course.videos" },
          },
        },
      ]);
      res.json({
        data: {
          ownedCourse: user,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getUserById: async (req, res, next) => {
    try {
      const userid = req.params.userId;

      const result = await userIdSchema.validateAsync({ userId: userid });
      const userId = result.userId;
      const user = await User.findById(userId, {
        name: 1,
        username: 1,
        domain: 1,
        bio: 1,
        profileimg: 1,
      });
      if (!user) {
        return next(new ErrorHandler(404, "No user found"));
      }
      res.json({
        success: true,
        message: "user found",
        data: {
          user,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
module.exports = userCtrl;

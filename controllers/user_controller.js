const { User } = require("../models");
const { profileSchema, courseIdSchema } = require("../utils/validator");

const userCtrl = {
  uploadProfilePicture: async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      user.profileimg = `public/thumbnail` + req.file.filename;
      await user.save();
      res.json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: {
          profileimg: user.profileimg,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  updateProfile: async (req, res, next) => {
    try {
      const result = await profileSchema.validateAsync(req.body);
      const { name, username, domain, bio } = result;
      const user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({ message: "Username already taken" });
      }
      await User.findByIdAndUpdate(req.user._id, {
        name,
        username,
        domain,
        bio,
      });
      return;
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
      const courseid = req.param.courseId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const user = req.user;
      const courseIndex = user.cart.indexOf(courseId);
      if (courseIndex == -1) {
        return next(new ErrorHandler(400, "No course found"));
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
      const courseid = req.param.courseId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const user = req.user;
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
      const courseid = req.param.courseId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const user = req.user;
      const courseIndex = user.wishlist.indexOf(courseId);
      if (courseIndex == -1) {
        return next(new ErrorHandler(400, "No course found"));
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
    getCompletedCourse: async (req, res, next) => {
        try {
            const user = req.user;
            const completedCourse = await User.findById(user._id).populate({
                path: "completedCourse",
                select: "_id title description thumbnail category price rating duration",
            });
            res.json({
                success: true,
                message: "completed courses",
                data: {
                    completedCourse
                }
            })
        } catch (e) {
            next(e)
      }
  }
};
module.exports = userCtrl;

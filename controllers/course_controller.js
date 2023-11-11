const { Course, Category, User } = require("../models");
const ErrorHandler = require("../middlewares/error");
// const redis = require("redis");
const { paramSchema } = require("../utils/validator");
//const Enrollment = require('../models/Enrollment');

// const redisClient = redis.createClient();
// redisClient.connect().catch(console.error);

// const DEFAULT_EXPIRATION = 3600;
const courseCtrl = {
  getCourses: async (req, res, next) => {
    const key = req.originalUrl;
    // const cachedData = await redisClient.get(key);
    // if (cachedData) {
    //   return res.json(JSON.parse(cachedData));
    // }
    try {
      const courses = await Course.find({ isPublished: true })
        .sort("-createdAt")
        .populate("videos", "_id videoTitle videoUrl")
        .populate({
          path: "createdBy",
          select: "_id username name",
        });
      // .populate("createdBy", "_id username name createdCourse ");
      const value = {
        success: true,
        message: "list of all courses",
        data: {
          courses,
        },
      };
      res.json(value);
      // redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(value));
    } catch (e) {
      next(e);
    }
  },
  getCourseByid: async (req, res, next) => {
    try {
      const id = req.params.courseId;
      const result = await paramSchema.validateAsync({ params: id });
      const courseId = result.params;
      const course = await Course.findById(courseId, {
        isPublished: true,
        isPublished: 0,
        updatedAt: 0,
        __v:0,
      })
        .populate({
          path: "createdBy",
          select: "_id username name",
        })
        .populate({
          path: "videos",
          select: "_id videoTitle videoUrl videoDuration",
        });
      if (!course) {
        return next(new ErrorHandler(400, "No course found"));
      }
      res.json({
        success: true,
        message: "Course Found",
        data: {
          course,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getCoursesByCategory: async (req, res, next) => {
    const key = req.originalUrl;
    // const cachedData = await redisClient.get(key);
    // if (cachedData) {
    //   return res.json(JSON.parse(cachedData));
    // }
    try {
      const category = req.params.category;

      const courses = await Course.aggregate([
        {
          $match: {
            category,
            isPublished: true,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdBy",
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            price: 1,
            duration: 1,
            totalStudents: 1,
            category: 1,
            rating: 1,
            thumbnail: 1,
            videos: { _id: 1, videoTitle: 1, videoUrl: 1 },
            createdBy: { _id: 1, username: 1, name: 1 },
          },
        },
      ]);
      if (!courses) {
        return next(
          new ErrorHandler(400, "No course is available with selected category")
        );
      }
      res.json({
        success: true,
        message: "List of all courses with selected category",
        data: {
          courses,
        },
      });
      // redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(courses));
    } catch (e) {
      next(e);
    }
  },
  getCategoriesName: async (req, res, next) => {
    // const key = req.originalUrl;
    // const cachedData = await redisClient.get(key);
    // if (cachedData) {
    //   return res.json(JSON.parse(cachedData));
    // }
    try {
      const categories = await Category.find();
      const categoryName = categories.map((category) => category.name);
      const value = {
        success: true,
        message: "List of categories",
        data: {
          categories: categoryName,
        },
      };

      res.json({
        value,
      });

      // redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(value));
    } catch (e) {
      next(e);
    }
  },
  getCategoriesData: async (req, res, next) => {
    // const key = req.originalUrl;
    // const cachedData = await redisClient.get(key);
    // if (cachedData) {
    //   return res.json(JSON.parse(cachedData));
    // }
    try {
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pagesize);
      const limit = parseInt(req.query.limit);
      const startIndex = (page - 1) * pageSize;
      // const endIndex = page * pageSize

      const categories = await Category.find()
        .skip(startIndex)
        .limit(pageSize)
        .populate({
          path: "courses",
          select: "_id title description category price rating duration ",
          options: {
            limit: limit ? limit : pageSize,
          },
          populate: {
            path: "createdBy",
            select: "_id username name",
          },
        });
      console.log(page);
      const value = {
        success: true,
        message: "Data of all courses in particular category",
        data: {
          categories,
        },
      };

      res.json({
        value,
      });
      // redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(value));
    } catch (e) {
      next(e);
    }
  },
  addCourseToCart: async (req, res, next) => {
    try {
      const courseid = req.params.courseId;
      const result = await paramSchema.validateAsync({ params: courseid });
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

  searchCourses: async (req, res, next) => {
    try {
      const query = req.query.coursetitle;

      // const courses = await Course.find({
      //   $or: [
      //     { title: { $regex: query, $options: "i" } },
      //     { description: { $regex: query, $options: "i" } },
      //   ],
      // });

      // res.render("course-search", { courses });
      // const courses = await Course.find();
      // const options = {
      //   keys: ['title'],
      //   includeScore: true,

      // }
      // const fuse = new Fuse(courses, options);
      // const searchquery = req.query.coursetitle
      // const results = fuse.search(searchquery);
      // res.json({
      //   success: true,
      //   message: "List of courses",
      //   data: {
      //     results
      //   }x`
      // })
    } catch (error) {
      //res.status(500).json({ error: 'Error searching for courses.' });
      next(error);
    }
  },

  enrollCourse: async (req, res, next) => {
    try {
      const courseId = req.params.courseId;
      const userId = req.user.id;

      const existingEnrollment = await Enrollment.findOne({ courseId, userId });
      if (existingEnrollment) {
        return next(
          new ErrorHandler(400, "You are already enrolled in this course.")
        );
      }

      const newEnrollment = new Enrollment({ courseId, userId });
      await newEnrollment.save();

      res.json({
        message: "Enrollment successful",
      });
    } catch (err) {
      next(err);
    }
  },
  getPopularCourses: async (req, res, next) => {
    try {
      // const popularCourses = await Course.find({ isPopular: true })
      //     .sort("-createdAt")
      //     .populate("videos", "_id videoTitle videoUrl")
      //     .populate("createdBy", "_id username name");
      const popularCourses = await Course.aggregate([
        {
          $match: {
            isPopular: true, //there is no field like this
            isPublished: true,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $lookup: {
            from: "Video",
            localField: "videos",
            foreignField: "_id",
            as: "videos",
          },
        },
        {
          $lookup: {
            from: "User",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdBy",
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            price: 1,
            duration: 1,
            totalStudents: 1,
            category: 1,
            rating: 1,
            thumbnail: 1,
            videos: { _id: 1, videoTitle: 1, videoUrl: 1 },
            createdBy: { _id: 1, username: 1, name: 1 },
          },
        },
      ]);

      if (!popularCourses || popularCourses.length === 0) {
        // return next(
        //   new ErrorHandler (400, "No popular courses are available.")
        // );
        res.status(400).json("do not have any ");
      }

      res.json({
        success: true,
        message: "List of popular courses",
        data: {
          courses: popularCourses,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  deleteCourseFromCart: async (req, res, next) => {
    try {
      const courseid = req.param.courseId;
      const result = await paramSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const user = await User.findById(courseId);
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
      const user = await User.findById(req.user._id).populate("cart");
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
      const user = await User.findById(req.user._id).populate("wishlist");
      user.wishlist.push(courseId);
      await user.save();
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
      const result = await paramSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const user = await User.findById(req.user);
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
      const result = await paramSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const user = await user.findById(req.user);
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

  rateCourse: async (req, res, next) => {
    try {
      const { courseId, rating, weight } = req.body;

      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      course.ratings.push({
        rating,
        weight,
      });

      await course.save();

      let totalWeightedRating = 0;
      let totalWeight = 0;

      for (const r of course.ratings) {
        totalWeightedRating += r.rating * r.weight;
        totalWeight += r.weight;
      }

      const weightedAverageRating = totalWeightedRating / totalWeight;

      course.popularity = calculatePopularity(
        weightedAverageRating,
        course.ratings.length
      );

      course.averageRating = weightedAverageRating;
      await course.save();

      res.json({ message: "Rating submitted successfully" });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = courseCtrl;

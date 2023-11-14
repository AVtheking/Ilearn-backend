const { Course, Category, User } = require("../models");
const { ErrorHandler } = require("../middlewares/error");
// const redis = require("redis");
const {
  courseIdSchema,
  ratingSchema,
  editReviewSchema,
  deleteReviewSchema,
} = require("../utils/validator");
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
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pagesize);
      // const limit = req.query.limit
      const startIndex = (page - 1) * pageSize;
      const coursesCount = await Course.countDocuments();
      const totalPages = Math.ceil(coursesCount / pageSize);

      // const courses = await Course.find({ isPublished: true })
      //   .sort("-createdAt")
      //   .skip(startIndex)
      //   .limit(pageSize)
      const courses = await Course.aggregate([
        {
          $match: {
            isPublished: true,
          },
        },
        {
          $skip: startIndex,
        },
        {
          $limit: pageSize,
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
            ratings: 0,
            videos: 0,
            isPublished: 0,
            updatedAt: 0,
            ownedBy: 0,
            __v: 0,
            createdBy: {
              email: 0,
              password: 0,
              verify: 0,
              role: 0,
              shortId: 0,
              __v: 0,
              createdCourse: 0,
              ownedCourse: 0,
              cart: 0,
              wishlist: 0,
            },
          },
        },
      ]);
      // .populate("createdBy", "_id username name createdCourse ");
      const value = {
        success: true,
        message: "list of all courses",
        data: {
          courses,
          totalPages,
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
      const result = await courseIdSchema.validateAsync({ params: id });
      const courseId = result.params;
      const course = await Course.findById(courseId, {
        isPublished: true,
        isPublished: 0,
        updatedAt: 0,
        __v: 0,
        ratings: 0,
      })
        .populate({
          path: "createdBy",
          select: "_id username name",
        })
        .populate({
          path: "videos",
          select:
            "_id videoTitle videoUrl videoDuration videoUrl_144p videoUrl_360p videoUrl_720p",
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
    // const key = req.originalUrl;
    // const cachedData = await redisClient.get(key);
    // if (cachedData) {
    //   return res.json(JSON.parse(cachedData));
    // }
    try {
      const category = req.params.category;
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pagesize);
      const startIndex = (page - 1) * pageSize;
      const totalCourses = await Course.countDocuments({
        category,
        isPublished: true,
      });
      // console.log(totalCourses)
      const totalPages = Math.ceil(totalCourses / pageSize);

      const courses = await Course.aggregate([
        {
          $match: {
            category,
            isPublished: true,
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
          $skip: startIndex,
        },
        {
          $limit: pageSize,
        },
        {
          $sort: {
            createdAt: -1,
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
          totalPages,
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
      const categoriesCount = await Category.countDocuments();
      const totalPages = Math.ceil(categoriesCount / pageSize);

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

      // const totalPages = Math.ceil(categories.length / pageSize);

      const value = {
        success: true,
        message: "Data of all courses in a particular category",
        data: {
          categories,
          totalPages,
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

  searchCourses: async (req, res, next) => {
    try {
      const query = req.query.coursetitle;
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
      const popularCourses = await Course.find({
        rating: { $gt: 4.2 },
        isPublished: true,
      })
        .sort({ rating: -1 })
        .limit(10);

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

  rateCourse: async (req, res, next) => {
    try {
      // const { courseId, rating, comment } = req.body;
      const result = await ratingSchema.validateAsync(req.body);
      const { courseId, rating, comment } = result;
      const userRating = rating;
      console.log(userRating);
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(404, "Course not found"));
      }
      if (!course.isPublished) {
        return next(new ErrorHandler(400, "Course is not published yet"));
      }

      const reviewIndex = course.reviews.findIndex((review) =>
        review.user.equals(req.user._id)
      );
      if (reviewIndex != -1) {
        const review = course.reviews[reviewIndex];
        course.ratings.set(
          review.rating,
          course.ratings.get(review.rating) - 1
        );
        course.reviews.splice(reviewIndex, 1);
      }
      course.ratings.set(userRating, course.ratings.get(userRating) + 1);
      let totalWeightedRating = 0;
      let totalStudents = 0;
      for (const [rating, count] of course.ratings.entries()) {
        totalWeightedRating += rating * count;
        totalStudents += count;
      }
      const weightedRating = totalWeightedRating / totalStudents;
      course.rating = weightedRating;
      // await course.save();
      const review = {
        user: req.user._id,
        rating: userRating,
        comment,
      };
      // await review.save()
      course.reviews.push(review);
      await course.save();

      res.json({
        success: true,
        message: "Course rated successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  downloadNotes: async (req, res, next) => {
    try {
      const courseid = req.params.courseId;
      const path = req.query.path;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const course = await Course.findById(courseId);
      const notesIndex = course.notes.indexOf(path);
      if (notesIndex == -1) {
        return next(new ErrorHandler(400, "No notes found"));
      }

      res.download(path, notesIndex + "-" + "notes.pdf");
    } catch (e) {
      next(e);
    }
  },
  getReviews: async (req, res, next) => {
    try {
      const params = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params });
      const courseId = result.params;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(404, "Course not found"));
      }
      res.json({
        success: true,
        message: "List of reviews",
        data: {
          reviews: course.reviews,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  editReview: async (req, res, next) => {
    try {
      // const { courseId, reviewId, review } = req.body;
      const result = await editReviewSchema.validateAsync(req.body);
      const { courseId, reviewId, review } = result;
      const user = req.user;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(404, "Course not found"));
      }
      const reviewIndex = course.reviews.findIndex((review) =>
        review._id.equals(reviewId)
      );
      if (reviewIndex == -1) {
        return next(new ErrorHandler(404, "Review not found"));
      }
      if (!course.reviews[reviewIndex].user.equals(user._id)) {
        return next(
          new ErrorHandler(400, "You are not the owner of the review")
        );
      }
      course.reviews[reviewIndex].comment = review;
      await course.save();
      res.json({
        success: true,
        message: "Review changed successfully",
        data: {
          review: course.reviews[reviewIndex],
        },
      });
    } catch (e) {
      next(e);
    }
  },
  deleteReview: async (req, res, next) => {
    try {
      // const { courseId, reviewId } = req.body;
      const result = await deleteReviewSchema.validateAsync(req.body);
      const { courseId, reviewId } = result;
      const user = req.user;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(404, "Course not found"));
      }
      const reviewIndex = course.reviews.findIndex((review) =>
        review._id.equals(reviewId)
      );
      if (reviewIndex == -1) {
        return next(new ErrorHandler(404, "Review not found"));
      }
      if (!course.reviews[reviewIndex].user.equals(user._id)) {
        return next(
          new ErrorHandler(400, "You are not the owner of the review")
        );
      }
      console.log(reviewIndex);

      const review = course.reviews[reviewIndex];
    
      course.ratings.set(review.rating, course.ratings.get(review.rating) - 1);
      course.reviews.splice(reviewIndex, 1);

      //recalculating weighted rating here
      let totalWeightedRating = 0;
      let totalStudents = 0;
      for (const [rating, count] of course.ratings.entries()) {
        totalWeightedRating += rating * count;
        totalStudents += count;
      }
      const weightedRating = totalWeightedRating / totalStudents;
      if (weightedRating) {
        course.rating = weightedRating;
      }
      else {
        course.rating = 4;
      }
      await course.save();
      res.json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = courseCtrl;

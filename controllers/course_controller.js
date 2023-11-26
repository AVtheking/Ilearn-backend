const { Course, Category, User, PopularSearch } = require("../models");
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
    const key = req.coriginalUrl;
    // const cachedData = await redisClient.get(key);
    // if (cachedData) {
    //   return res.json(JSON.parse(cachedData));
    // }
    try {
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pagesize);

      const startIndex = (page - 1) * pageSize;
      const coursesCount = await Course.countDocuments();
      const totalPages = Math.ceil(coursesCount / pageSize);

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
          $unwind: "$createdBy",
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
            createdAt: 1,
            updatedAt: 1,
            createdBy: { _id: 1, username: 1, name: 1 },
          },
        },
      ]);

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
    let in_cart = false;
    let in_wishlist = false;
    let owned = false;

    try {
      const id = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params: id });
      const courseId = result.params;
      const course = await Course.findById(courseId, {
        isPublished: true,
        isPublished: 0,

        __v: 0,
        ratings: 0,
      })
        .populate({
          path: "createdBy",
          select: "_id username name profileimg  domain bio",
        })
        .populate({
          path: "videos.video",
          select:
            "_id videoTitle videoUrl videoDuration videoUrl_144p videoUrl_360p videoUrl_720p",
        })
        .populate({
          path: "preview",
          select:
            "_id videoTitle videoUrl videoDuration videoUrl_144p videoUrl_360p videoUrl_720p",
        })
        .populate({
          path: "reviews.user",
          select: "_id username name profileimg",
        });

      if (!course) {
        return next(new ErrorHandler(400, "No course found"));
      }
      const user = req.user;
      const courseIdIndex = user.ownedCourse.findIndex((course) =>
        course.courseId.equals(courseId)
      );

      const cartIdIndex = user.cart.findIndex((course) =>
        course.equals(courseId)
      );
      const wishlistIdIndex = user.wishlist.findIndex((course) =>
        course.equals(courseId)
      );

      if (cartIdIndex != -1) {
        in_cart = true;
      }
      if (wishlistIdIndex != -1) {
        in_wishlist = true;
      }

      const responsePayLoad = {
        success: true,
        message: "Course Found",
        data: {
          course,
          in_cart,
          in_wishlist,
        },
      };
      // let completedVideo = 0;
      if (courseIdIndex != -1) {
        owned = true;
        const completedVideo =
          user.ownedCourse[courseIdIndex].completedVideo.length;
        responsePayLoad.data.completedVideo = completedVideo;
        responsePayLoad.data.owned = owned;
      }
      res.json(responsePayLoad);
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
          $unwind: "$createdBy",
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
            weightedRating: 1,
            rating: 1,
            thumbnail: 1,
            createdAt: 1,
            updatedAt: 1,
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

      const categoriesCount = await Category.countDocuments();
      const totalPages = Math.ceil(categoriesCount / pageSize);

      const categories = await Category.find()
        .skip(startIndex)
        .limit(pageSize)
        .select({ __v: 0 })
        .populate({
          path: "courses",
          select:
            "_id title description category price thumbnail rating weightedRating duration createdAt updatedAt ",
          options: {
            limit: limit ? limit : pageSize,
          },

          populate: {
            path: "createdBy",
            select: "_id username name",
          },
        });

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
  getPopularSearch: async (req, res, next) => {
    try {
      const popularSearch = await PopularSearch.find()
        .sort({ count: -1 })
        .select({ search: 1, _id: 0 })
        .limit(5);

      res.json({
        success: true,
        message: "List of popular searches",
        data: {
          popularSearch,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  searchCourses: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pagesize);
      const startIndex = (page - 1) * pageSize;

      const searchquery = req.query.coursetitle;
      await PopularSearch.findOneAndUpdate(
        {
          search: searchquery,
        },
        { $inc: { count: 1 } },
        { upsert: true }
      );
      const result = await Course.aggregate([
        {
          $search: {
            text: {
              path: "title",
              query: searchquery,
              fuzzy: {},
            },
          },
        },
        {
          $match: {
            isPublished: true,
          },
        },
        {
          $facet: {
            searchResults: [
              { $skip: startIndex },
              { $limit: pageSize },
              {
                $project: {
                  _id: 1,
                  title: 1,
                },
              },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ]);
      const searchResults = result[0].searchResults;
      const totalCount = result[0].totalCount[0]
        ? result[0].totalCount[0].count
        : 0;

      // console.log(result[0].totalCount[0].count);
      const totalPages = Math.ceil(totalCount / pageSize);

      res.json({
        success: true,
        message: "List of courses from search",
        data: {
          courses: searchResults,
          totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  getPopularCourses: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pagesize);
      const startIndex = (page - 1) * pageSize;

      const coursesCount = await Course.countDocuments({
        isPublished: true,
        weightedRating: { $gte: 4.2 },
      });

      const totalPages = Math.ceil(coursesCount / pageSize);
      const popularCourses = await Course.aggregate([
        {
          $match: {
            isPublished: true,
            rating: { $gte: 4 },
          },
        },
        {
          $sort: { weightedRating: -1 },
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
          $unwind: "$createdBy",
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
            createdAt: 1,
            updatedAt: 1,
            weightedRating: 1,
            createdBy: { _id: 1, username: 1, name: 1 },
          },
        },
      ]);

      res.json({
        success: true,
        message: "List of popular courses",
        data: {
          courses: popularCourses,
          totalPages,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  rateCourse: async (req, res, next) => {
    try {
      const result = await ratingSchema.validateAsync(req.body);
      const { courseId, rating, comment } = result;
      const userRating = rating;

      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(404, "Course not found"));
      }
      if (!course.isPublished) {
        return next(new ErrorHandler(400, "Course is not published yet"));
      }
      const user = req.user;
      // const courseIdIndex = user.ownedCourse.findIndex((course) =>
      //   course.courseId.equals(courseId)
      // );
      // if (courseIdIndex == -1) {
      //   return next(
      //     new ErrorHandler(400, "You have not enrolled in this course")
      //   );
      // }

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
      if (totalStudents == 0) {
        course.weightedRating = 0;
      }

      const Rating = totalWeightedRating / totalStudents;
      course.rating = Rating;
      const courses = await Course.aggregate([
        {
          $match: {
            isPublished: true,
            rating: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
          },
        },
      ]);
      const cummulative_rating = courses[0].avgRating;
      // console.log(cummulative_rating);
      const default_rating = 50;
      course.weightedRating =
        (Rating * totalStudents + default_rating * cummulative_rating) /
        (totalStudents + default_rating);

      const review = {
        user: req.user._id,
        rating: userRating,
        comment,
      };

      course.reviews.push(review);
      await course.save();
      const educator_courses = await Course.aggregate([
        {
          $match: {
            createdBy: course.createdBy,
            isPublished: true,
            rating: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$weightedRating" },
          },
        },
      ]);
      console.log(educator_courses[0].avgRating);
      user.educator_rating = educator_courses[0].avgRating;
      if (user.educator_rating >= 2.5) {
        user.is_certified_educator = true;
      }
      await user.save();

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
      const user = req.user;
      const courseIdIndex = user.ownedCourse.findIndex((course) =>
        course.courseId.equals(courseId)
      );
      if (courseIdIndex == -1) {
        return next(
          new ErrorHandler(400, "You have not enrolled in this course")
        );
      }
      const notesIndex = course.notes.indexOf(path);
      if (notesIndex == -1) {
        return next(new ErrorHandler(400, "No notes found"));
      }

      res.download(path, notesIndex + "-" + "notes.pdf");
    } catch (e) {
      next(e);
    }
  },
  downloadVideo: async (req, res, next) => {
    try {
      const courseid = req.params.courseId;
      const lectureId = req.params.lectureId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const course = await Course.findById(courseId);
      const user = req.user;
      if (!course) {
        return next(new ErrorHandler(404, "No course found"));
      }
      const courseIdIndex = user.ownedCourse.findIndex((course) =>
        course.courseId.equals(courseId)
      );
      if (courseIdIndex == -1) {
        return next(
          new ErrorHandler(400, "You have not enrolled in this course")
        );
      }
      const videoIndex = course.videos.indexOf(lectureId);
      if (videoIndex == -1) {
        return next(new ErrorHandler(400, "Lecture not found in the course"));
      }
      const videoPath = req.query.path;
      res.download(videoPath, videoIndex + "-" + "video.mp4");
    } catch (e) {
      next(e);
    }
  },
  getReviews: async (req, res, next) => {
    try {
      const params = req.params.courseId;
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pagesize);
      const startIndex = (page - 1) * pageSize;
      const result = await courseIdSchema.validateAsync({ params });
      const courseId = result.params;
      const course = await Course.findById(courseId).populate({
        path: "reviews.user",
        select: "_id username name profileimg",
      });
      if (!course) {
        return next(new ErrorHandler(404, "Course not found"));
      }
      // const totalPage = await course.reviews.countDocuments();
      // const totalPages = Math.ceil(totalPage / pageSize);
      const paginatedReviews = course.reviews.slice(
        startIndex,
        startIndex + pageSize
      );
      const totalPages = Math.ceil(course.reviews.length / pageSize);
      // console.log(course.reviews.length);
      res.json({
        success: true,
        message: "List of reviews",
        data: {
          reviews: paginatedReviews,
          totalPages,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  editReview: async (req, res, next) => {
    try {
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
      } else {
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

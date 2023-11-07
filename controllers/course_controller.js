const { Course } = require("../models");
const ErrorHandler = require("../middlewares/error");
//const Enrollment = require('../models/Enrollment');

const courseCtrl = {
  getCourses: async (req, res, next) => {
    try {
      const courses = await Course.find()
        .sort("-createdAt")
        .populate("videos", "_id videoTitle videoUrl")
        .populate("createdBy", "_id username name");
      res.json({
        success: true,
        message: "list of all courses",
        data: {
          courses,
        },
      });
    } catch (e) {
      next(e);
    }
  },
  getCoursesByCategory: async (req, res, next) => {
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
    } catch (e) {
      next(e);
    }
  },
  searchCourses :async (req, res, next) => {
    try {
      const query = req.query.coursetitle; 

      const courses = await Course.find({
        $or: [
          { title: { $regex: query, $options: 'i' } }, 
          { description: { $regex: query, $options: 'i' } }, 
        ],
      });
  
      res.render('course-search', { courses });
    } catch (error) {
     //res.status(500).json({ error: 'Error searching for courses.' });
      next(error); 
    }
  },
 
  enrollCourse : async (req, res, next) => {
  try {
    const courseId = req.params.courseId; 
    const userId = req.user.id; 

    const existingEnrollment = await Enrollment.findOne({ courseId, userId });
    if (existingEnrollment) {
    return next(new ErrorHandler(400, "You are already enrolled in this course."));
    }

    const newEnrollment = new Enrollment({ courseId, userId });
    await newEnrollment.save();

    res.json({ 
      message: 'Enrollment successful'
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
            isPopular: true,
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
        res.status(400).json("do not have any ")
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
    rateCourse : async (req, res, next) => {

      try {
        const { courseId, rating, weight } = req.body;
    
        const course = await Course.findById(courseId);
    
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
    
        course.ratings.push({ 
          rating, weight 
        });
    
        await course.save();
    
        let totalWeightedRating = 0;
        let totalWeight = 0;
    
        for (const r of course.ratings) {
          totalWeightedRating += r.rating * r.weight;
          totalWeight += r.weight;
        }
    
        const weightedAverageRating = totalWeightedRating / totalWeight;

        course.popularity = calculatePopularity(weightedAverageRating, course.ratings.length);
    
        course.averageRating = weightedAverageRating;
        await course.save();
    
        res.json({ message: 'Rating submitted successfully' });
      } catch (error) {
        next(error);
      }
    },
  };

module.exports = courseCtrl;
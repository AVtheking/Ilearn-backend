const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    category: {
      type: String,
    },
    price: {
      type: String,
      default: 0,
    },
    duration: {
      type: String,
      default: 0,
    },
<<<<<<< HEAD
    rating: {
      type: Number,
      default: 4,
=======
    ratings:{
        type: mongoose.Mixed,
        1:1, 
        2:2,
        3:3,
        4:4,
        5:5,
    //default: {1:1, 2:1, 3:1, 4:1, 5:1}}
       default: 0,
>>>>>>> 0aa766d (Adding course operations)
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    popularity:{
      type:Number,
    }
  },
  {
    timestamps: true,
  }
);
const Course = new mongoose.model("Course", courseSchema);
module.exports = Course;

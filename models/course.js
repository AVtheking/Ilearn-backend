const mongoose = require("mongoose");

const reviewSchema = require("./review");
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
    notes: [
      {
        type: String,
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
    rating: {
      type: Number,

    },
    ratings: {
      type: Map,
      of: Number,
      default: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);
const Course = new mongoose.model("Course", courseSchema);
module.exports = Course;

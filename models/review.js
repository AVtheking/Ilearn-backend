const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rating: {
      type: String,
      // required: true,
    },
    comment: {
      type: String,
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = reviewSchema;
// Path: models/course.js

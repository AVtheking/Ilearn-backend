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
    ownedBy: [//have to use joi here to calculate totalstudents
    
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: 0,
      },
    ],
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
    rating: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const Course = new mongoose.model("Course", courseSchema);
module.exports = Course;

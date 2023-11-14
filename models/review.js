const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
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
});
module.exports = reviewSchema;
// Path: models/course.js
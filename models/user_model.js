const mongoose = require("mongoose");
const shortId = require("shortid");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: {
    type: String,
    required: true,
  },

  shortId: {
    type: String,
    default: shortId.generate,
  },

  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  domain: {
    type: String,
  },
  bio: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
  profileimg: {
    type: String,
  },
  // createdCourse: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Course",
  //   },
  // ],
  // ownedCourse: [
  //   {
  //     courseId: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "Course",
  //     },
  //     completedVideo: [
  //       {
  //         type: mongoose.Schema.Types.ObjectId,
  //         ref: "Video",
  //       },
  //     ],
  //   },
  // ],
  // cart: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Course",
  //   },
  // ],
  // wishlist: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Course",
  //   },
  // ],
  // completedCourse: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Course",
  //   },
  // ],
  wallet: {
    type: Number,
    default: 0,
  },
  educator_rating: {
    type: Number,
    default: 0,
  },
  is_certified_educator: {
    type: Boolean,
    default: false,
  },
});
// userSchema.path("createdCourse").default(() => []);
// userSchema.path("ownedCourse").default(() => []);

const User = new mongoose.model("User", userSchema);
module.exports = User;

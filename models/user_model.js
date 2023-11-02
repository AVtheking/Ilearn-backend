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
  role: {
    type: String,
    default: "user",
  },
  profileimg: {
    type: String,
  },
  createdCourse: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  ownedCourse: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});
const User = new mongoose.model("User", userSchema);
module.exports = User;

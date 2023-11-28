const mongoose = require("mongoose");
const ownedCoursesSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  completedVideo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
const ownedCourse = new mongoose.model("ownedCourse", ownedCoursesSchema);

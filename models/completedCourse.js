const mongoose = require("mongoose")
const completedCourseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",

    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
})
const completedCourse = new mongoose.model("completedCourse", completedCourseSchema)    
module.exports = completedCourse;
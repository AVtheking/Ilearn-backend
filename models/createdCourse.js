const mongoose = require("mongoose")
const createdCoursesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },

})
const createdCourse = new mongoose.model("createdCourse", createdCoursesSchema)
module.exports = createdCourse;
const mongoose = require("mongoose")
const completedVideoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",

    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    },
})
const completedVideo = new mongoose.model("completedVideo", completedVideoSchema)
module.exports = completedVideo;
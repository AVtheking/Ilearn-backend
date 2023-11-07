const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  videoTitle: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  videoDuration: {
    type: Number,
    required: true,
  },
});
const Video = new mongoose.model("Video", videoSchema);
module.exports = Video;

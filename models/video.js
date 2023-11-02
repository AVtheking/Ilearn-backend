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
});
const Video = new mongoose.model("Video", videoSchema);
module.exports = Video;

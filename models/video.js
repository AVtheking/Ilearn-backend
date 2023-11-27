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
  // videoUrl_144p: {
  //   type: String,
  // },
  // videoUrl_360p: {
  //   type: String,
  // },
  // videoUrl_720p: {
  //   type: String,
  // },
  videoDuration: {
    type: Number,
    required: true,
  },
});
const Video = new mongoose.model("Video", videoSchema);
module.exports = Video;

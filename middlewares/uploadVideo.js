const multer = require("multer");
const path = require("path");
const { getVideoDurationInSeconds } = require("get-video-duration");

const videoStorage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "public/course_videos");
  },
  filename: (req, file, cb) => {
    // console.log(file);
    // const du = getVideoDurationInSeconds(file.originalname)
    // console.log(du)
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 90000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
      return cb(new Error("Please upload a video"));
    }
    cb(undefined, true);
  },
}).single("video");
module.exports = uploadVideo;

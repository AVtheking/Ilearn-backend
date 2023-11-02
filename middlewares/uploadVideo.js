const multer = require("multer");
const path = require("path");

const videoStorage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "public/course_videos");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + file.originalname);
  },
});
const uploadVideo = multer({ storage: videoStorage }).single("video");
module.exports = uploadVideo;

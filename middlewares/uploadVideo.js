const multer = require("multer");
const path = require("path");
const { getVideoDurationInSeconds } = require("get-video-duration");
const fs = require("fs");
const { ErrorHandler } = require("./error");
const Videodirectory = "public/course_videos";
const NotesDirectory = "public/course_notes";

if (!fs.existsSync(Videodirectory)) {
  fs.mkdirSync(Videodirectory);
}
// if (!fs.existsSync(NotesDirectory)) {
//   fs.mkdirSync(NotesDirectory);
// }
// const storage = multer.diskStorage({
//   destination: (req, res, cb) => {
//     if (file.fieldname === "video") {
//       cb(null, "public/course_videos");
//     } else if (file.fieldname === "notes") {
//       cb(null, "public/course_notes");
//     } else {
//       cb(new Error("Invalid field name"), null);
//     }
//   },
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.filename + "-" + Data.now() + path.extname(file.originalname)
//     );
//   },
//   fileFilter: (req, file, cb) => {
//     if (file.fieldname == "video " && file.mimetype.startsWith("video")) {
//       cb(null, true);
//     } else if (
//       file.fieldname == "notes" &&
//       file.mimetype.startsWith("application/pdf")
//     ) {
//       cb(null, true);
//     } else {
//       cb(new ErrorHandler(400, "Invalid file type"), false);
//     }
//   },
// });
const videoStorage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "public/course_videos");
  },
  filename: (req, file, cb) => {

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

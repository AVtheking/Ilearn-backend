const multer = require("multer");
const path = require("path");
const { ErrorHandler } = require("./error");
const fs = require("fs");

const Videodirectory = "public/course_videos";
const NotesDirectory = "public/course_notes";

// Ensure the existence of "course_videos" directory
if (!fs.existsSync(Videodirectory)) {
  fs.mkdirSync(Videodirectory);
}

if (!fs.existsSync(NotesDirectory)) {
  fs.mkdirSync(NotesDirectory);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "video") {
      cb(null, Videodirectory);
    } else if (file.fieldname === "notes") {
      cb(null, NotesDirectory);
    } else {
      cb(new ErrorHandler(400, "Invalid field name"), null);
    }
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 90000000,
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
      cb(null, true);
    }  else if (file.originalname.match(/\.(pdf|ppt|jpeg|png|word|pptx)$/i)) {
      cb(null, true);
    } else {
      cb(new ErrorHandler(400, "Invalid file type"), false);
    }
  },
});

module.exports = upload;

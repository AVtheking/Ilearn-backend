const multer = require("multer");
const path = require("path");
const fs = require("fs");
const thumbnailDirectory = "public/thumbnail";

// Create the "thumbnail" directory if it doesn't exist
if (!fs.existsSync(thumbnailDirectory)) {
  fs.mkdirSync(thumbnailDirectory);
}
const imagestorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/thumbnail");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadImage = multer({
  storage: imagestorage,
}).single("image");

module.exports = uploadImage;

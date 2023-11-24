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
const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);

  }
  else {
    cb(new Error("Only jpeg, jpg and png format allowed"));
  }
}

const uploadImage = multer({
  storage: imagestorage,
}).single("image");

module.exports = uploadImage;

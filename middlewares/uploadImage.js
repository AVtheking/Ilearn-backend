const multer = require("multer");
const path = require("path");

const imagestorage = multer.diskStorage({
    destination: function (req, file, cb) {
       cb(null, "public/images") 
    },
    filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  
  const uploadImage = multer({ 
    storage: imagestorage 
  }).single("image");

module.exports = uploadImage;


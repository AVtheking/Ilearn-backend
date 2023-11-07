const express = require("express");
const { auth } = require("../middlewares");
const imageRouter = express.Router();
const imageCtrl = require("../controllers/image_controller");

imageRouter.post("/upload", auth, imageCtrl.uploadImage);
//imageRouter.post ("/upload", auth );
module.exports = imageRouter;

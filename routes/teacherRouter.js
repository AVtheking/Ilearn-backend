const express = require("express");
const teacherRouter = express.Router();
const { teacherCtrl } = require("../controllers");
const {auth,uploadVideo} = require("../middlewares");

teacherRouter.patch("/become-instructor", auth, teacherCtrl.becomeTeacher);
teacherRouter.post("/create-course", auth, teacherCtrl.createCourse);
teacherRouter.post("/upload-video/:courseId", auth, uploadVideo,teacherCtrl.uploadVideo_toCourse);

module.exports = teacherRouter;
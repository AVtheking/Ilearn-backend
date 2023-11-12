const express = require("express");
const teacherRouter = express.Router();
const { teacherCtrl } = require("../controllers");
const {auth,uploadVideo, uploadImage, uploadNotes} = require("../middlewares");

teacherRouter.patch("/become-instructor", auth, teacherCtrl.becomeTeacher);
teacherRouter.patch("/become-student", auth, teacherCtrl.becomeStudent);
teacherRouter.post("/create-course", auth,uploadImage, teacherCtrl.createCourse);
teacherRouter.post("/upload-video/:courseId", auth, uploadNotes.fields([{name:"video"},{name:"notes"}]), teacherCtrl.uploadVideo_toCourse);
teacherRouter.post("/publish-course/:courseId", auth, teacherCtrl.publishCourse);
teacherRouter.post("/add-category", auth, teacherCtrl.addCategory)
teacherRouter.patch("/add-lecture/:courseId", auth, uploadVideo, teacherCtrl.addlecture)
teacherRouter.delete("/remove-lecture/:courseId/lecture/:lectureId",auth,teacherCtrl.removeLecture)
teacherRouter.get('/search-teacher', teacherCtrl.searchTeacher);

module.exports = teacherRouter;
const express = require("express");
const teacherRouter = express.Router();
const { teacherCtrl } = require("../controllers");
const {auth,uploadVideo, uploadImage, uploadNotes} = require("../middlewares");

teacherRouter.patch("/become-instructor", auth, teacherCtrl.becomeTeacher);
teacherRouter.patch("/become-student", auth, teacherCtrl.becomeStudent);
// teacherRouter.patch("/add-lecture/:courseId", auth, uploadVideo, teacherCtrl.addlecture)
teacherRouter.patch("/change-thumbnail/:courseId", auth, uploadImage, teacherCtrl.changeThumbnail)
teacherRouter.patch("/update-course/:courseId", auth, uploadImage, teacherCtrl.updateCourse)

teacherRouter.post("/create-course", auth,uploadImage, teacherCtrl.createCourse);
teacherRouter.post("/upload-video/:courseId", auth, uploadNotes.fields([{name:"video"},{name:"notes"}]), teacherCtrl.uploadVideo_toCourse);
teacherRouter.post("/publish-course/:courseId", auth, teacherCtrl.publishCourse);
// teacherRouter.post("/add-category", auth, teacherCtrl.addCategory)

teacherRouter.get('/search-teacher',auth, teacherCtrl.searchTeacher);
teacherRouter.get("/created-course", auth, teacherCtrl.getCreatedCourses);

teacherRouter.delete("/remove-lecture/:courseId/lecture/:lectureId",auth,teacherCtrl.removeLecture)
teacherRouter.delete("/delete-course/:courseId", auth, teacherCtrl.deleteCourse)

module.exports = teacherRouter;
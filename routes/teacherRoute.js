const express = require("express");
const {teacherCtrl}=require("../controllers")
const teacherRouter = express.Router();

teacherRouter.post("/teacher/sign-up", teacherCtrl.signUp);
teacherRouter.post("/teacher/verify-email", teacherCtrl.verifyEmail);
teacherRouter.post("/teacher/sign-in", teacherCtrl.signIn);
teacherRouter.post("/teacher/forget-password", teacherCtrl.forgetPassword);
teacherRouter.post("/teacher/verify-otp", teacherCtrl.verifyOtp);
teacherRouter.post("/teacher/change-password", teacherCtrl.changePassword);

module.exports = teacherRouter;

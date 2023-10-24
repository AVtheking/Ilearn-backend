const express = require("express");
const authCtrl = require("../controllers/auth_controller");
const authRouter = express.Router();

authRouter.post("/sign-up", authCtrl.signUp);
authRouter.post("/verify-email", authCtrl.verifyEmail);
authRouter.post("/sign-in", authCtrl.signIn);
authRouter.post("/forget-password", authCtrl.forgetPassword);
authRouter.post("/verify-otp", authCtrl.verifyOtp);
authRouter.post("/resend-otp", authCtrl.resendOtp);
authRouter.post("/change-password", authCtrl.changePassword);

module.exports = authRouter;

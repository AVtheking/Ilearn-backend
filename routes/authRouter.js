const express = require("express");
const authCtrl = require("../controllers/auth_controller");
const auth = require("../middlewares/auth");
const { User } = require("../models");
const authRouter = express.Router();

authRouter.post("/sign-up", authCtrl.signUp);
authRouter.post("/verify-email", authCtrl.verifyEmail);
authRouter.post("/sign-in", authCtrl.signIn);
authRouter.post("/forget-password", authCtrl.forgetPassword);
authRouter.post("/verify-otp", authCtrl.verifyOtp);
authRouter.post("/resend-otp", authCtrl.resendOtp);
authRouter.post("/change-password", authCtrl.changePassword);
authRouter.get("/", auth, async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

module.exports = authRouter;

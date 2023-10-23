const User = require("../models/user_model");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const Otp = require("../models/otp_model");
const sendmail = require("../utils/mailer");
const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("../middlewares/errro");
const authSchema = require("../utils/validator");

const authCtrl = {
  signUp: async (req, res, next) => {
    try {
      //   const { username, email, password } = req.body;
      //   if (!username || !email || !password) {
      //     return next(new ErrorHandler(400, "Please Enter all fields"));
      //   }
      //   if (!validator.isEmail(email)) {
      //     return next(new ErrorHandler(400,"Invalid Email"));
      //   }
      const result = await authSchema.validateAsync(req.body);
      console.log(result);
      const username = result.username;
      const email = result.email;
      const password = result.password;

      let existingOtp = await Otp.findOne({ email });
      if (existingOtp) {
        await Otp.deleteOne({ email });
      }
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        if (!existingUser.isEmailVerified) {
          await User.deleteOne({ email });
        } else {
          return next(
            new ErrorHandler(400, "User with the same email already exists")
          );
        }
      }
      const hashedPassword = await bcryptjs.hash(result.password, 8);
      const otp = Math.floor(100000 + Math.random() * 900000);
      let OTP = new Otp({
        email,
        otp,
      });
      sendmail(result.email, otp);

      let user = new User({
        username,
        email,
        password: hashedPassword,
      });
      const type = req.header("x-user-type");
      if (type == "teacher") {
        user.type = "teacher";
      }
      user = await user.save();
      OTP = await OTP.save();
      res.status(201).json(user);
    } catch (err) {
      if (err.isJoi == true) {
        err.statusCode = 422;
      }
      next(err);
    }
  },
  verifyEmail: async (req, res, next) => {
    try {
      const { email, otp } = req.body;

      let OTP = await Otp.findOne({ email });
      if (otp != OTP?.otp || !OTP) {
        return next(new ErrorHandler(400, "Invalid otp"));
      }
      await User.findOneAndUpdate(
        { email },
        {
          isEmailVerified: true,
        },
        { new: true }
      );
      await Otp.deleteOne({ email });
      res.json({ msg: "Email is verified" });
    } catch (e) {
      next(e);
    }
  },
  signIn: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        // return res.status(400).json({ msg: "No user exists with this email" });
        return next(new ErrorHandler(400, "No user exists with this email "));
      }
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        // return res.status(401).json({ msg: "Incorrect password" });
        return next(new ErrorHandler(401, "Incorrect password"));
      }
      if (!user.isEmailVerified) {
        // return res.status(401).json({ msg: "Email is not verified" });
        return next(new ErrorHandler(401, "Email is not verified"));
      }
      const token = jwt.sign({ id: user._id }, "passwordKey");
      console.log(token);
      res.json({
        token,
        username: user.username,
        email,
        isEmailVerified: user.isEmailVerified,
        type: user.type,
      });
    } catch (e) {
      //   res.status(500).json({ error: e.message });
      next(e);
    }
  },
  forgetPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        // return res.status(400).json({ error: "This email is not registered" });
        return next(new ErrorHandler(400, "This email is not registered"));
      }
      const otp = Math.floor(1000 + Math.random() * 9000);
      let existingOtp = await Otp.findOne({ email });
      if (existingOtp) {
        await Otp.deleteOne({ email });
      }
      let OTP = new Otp({
        email,
        otp,
      });
      OTP = await OTP.save();
      sendmail(email, otp);
      res.json({ msg: "otp is send to your registered email" });
    } catch (e) {
      //   res.status(500).json({ error: e.message });
      next(e);
    }
  },
  verifyOtp: async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      let OTP = await Otp.findOne({ email });
      if (otp != OTP?.otp || !OTP) {
        // return res.status(400).json({ msg: "Invalid otp" });
        return next(new ErrorHandler(400, "Invalid otp"));
      }
      await Otp.deleteOne({ email });
      res.json({ msg: "otp is validated" });
    } catch (e) {
      //   res.status(500).json({ error: e.message });
      next(e);
    }
  },
  changePassword: async (req, res, next) => {
    try {
      const { email, newPassword } = req.body;

      let hashedPassword = await bcryptjs.hash(newPassword, 8);
      await User.findOneAndUpdate(
        { email },
        { password: hashedPassword },
        { new: true }
      );
      res.json({ msg: "password has been changed successfully" });
    } catch (e) {
      //   res.status(500).json({ error: e.message });
      next(e);
    }
  },
};
module.exports = authCtrl;

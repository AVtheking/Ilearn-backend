const validator = require("validator");
const bcryptjs = require("bcryptjs");

const sendmail = require("../utils/mailer");
const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("../middlewares/errro");
const { teacherSchema } = require("../utils/validator");
const { Teacher, Otp, User } = require("../models");
require("dotenv").config();

const teacherCtrl = {
  signUp: async (req, res, next) => {
    try {
      const result = await teacherSchema.validateAsync(req.body);
      console.log(result);
      const name = result.name;
      const email = result.email;
      const password = result.password;

      let existingOtp = await Otp.findOne({ email });
      if (existingOtp) {
        await Otp.deleteOne({ email });
      }
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(
          new ErrorHandler(400, "This email is already registered as student")
        );
      }
      let existingTeacher = await Teacher.findOne({ email });
      if (existingTeacher) {
        if (!existingTeacher.isEmailVerified) {
          await Teacher.deleteOne({ email });
        } else {
          return next(
            new ErrorHandler(400, "Teacher with the same email already exists")
          );
        }
      }
      const hashedPassword = await bcryptjs.hash(password, 8);
      const otp = Math.floor(100000 + Math.random() * 900000);
      let OTP = new Otp({
        email,
        otp,
      });
      sendmail(result.email, otp);

      let teacher = new Teacher({
        name,
        email,
        password: hashedPassword,
      });

      teacher = await teacher.save();
      OTP = await OTP.save();
      res.status(201).json(teacher);
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
      await Teacher.findOneAndUpdate(
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
      let teacher = await Teacher.findOne({ email });
      if (!teacher) {
        // return res.status(400).json({ msg: "No user exists with this email" });
        return next(new ErrorHandler(400, "No user exists with this email "));
      }
      const isMatch = await bcryptjs.compare(password, teacher.password);
      if (!isMatch) {
        // return res.status(401).json({ msg: "Incorrect password" });
        return next(new ErrorHandler(401, "Incorrect password"));
      }
      if (!teacher.isEmailVerified) {
        // return res.status(401).json({ msg: "Email is not verified" });
        return next(new ErrorHandler(401, "Email is not verified"));
      }
      const token = jwt.sign({ id: teacher._id }, process.env.TEACHER);
      console.log(token);
      res.json({
        token,
        name: teacher.name,
        email,
        isEmailVerified: teacher.isEmailVerified,
      });
    } catch (e) {
      //   res.status(500).json({ error: e.message });
      next(e);
    }
  },
  forgetPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      const teacher = await Teacher.findOne({ email });
      if (!teacher) {
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
      await Teacher.findOneAndUpdate(
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
module.exports = teacherCtrl;

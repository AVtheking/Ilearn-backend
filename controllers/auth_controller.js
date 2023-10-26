const bcryptjs = require("bcryptjs");
const sendmail = require("../utils/mailer");
const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("../middlewares/error");
const { authSchema } = require("../utils/validator");
const { User, Otp } = require("../models");
const shortid = require("shortid");
require("dotenv").config();

const authCtrl = {
  signUp: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);
      console.log(result);
      const username = result.username;
      const name = result.name;
      const email = result.email;
      const password = result.password;

      const hashedPassword = await bcryptjs.hash(password, 8);
      const otp = Math.floor(1000 + Math.random() * 9000);
      let existingOtp = await Otp.findOne({ email });
      if (existingOtp) {
        existingOtp.updateOne({
          otp,
        });
      } else {
        let OTP = new Otp({
          email,
          otp,
        });
        await OTP.save();
      }
      sendmail(result.email, otp);
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        if (!existingUser.verify) {
          existingUser.updateOne({
            username: username,
            email: email,
            password: hashedPassword,
          });
        } else {
          return next(
            new ErrorHandler(400, "User with the same email already exists")
          );
        }
      } else {
        let exsitingUsername = await User.findOne({ username });
        if (exsitingUsername) {
          return next(new ErrorHandler(400, "This username already exists"));
        }
        let user = new User({
          username,
          name,
          email,
          password: hashedPassword,
        });

        user.save();
      }

      res.status(201).json({
        success: true,
        message: "Sign up successful! Please verify your account.",
        data: {
          username,
          email,
        },
      });
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
      if (otp != OTP?.otp) {
        return next(new ErrorHandler(400, "Invalid otp"));
      }
      await User.findOneAndUpdate(
        { email },
        {
          verify: true,
        }
      );
      Otp.deleteOne({ email });
      res.json({ success: true, message: "Email is verified" });
    } catch (e) {
      next(e);
    }
  },

  signIn: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      // const result = await authSchema.validateAsync(req.body);
      // const email = result.email;
      // const password = result.passowrd;

      let user = await User.findOne({ email });
      if (!user) {
        return next(new ErrorHandler(400, "No user found "));
      }
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        // return res.status(401).json({ msg: "Incorrect password" });
        return next(new ErrorHandler(401, "Incorrect password"));
      }
      if (!user.verify) {
        return next(new ErrorHandler(401, "Email is not verified"));
      }
      const shortId = user.shortId;
      const payload = {
        id: user._id,
        uid: shortId,
      };
      const token = jwt.sign(payload, process.env.USER, {
        expiresIn: "2d",
      });
      // console.log(token);
      res.json({
        success: true,
        message: "User signed successfully",
        data: {
          token,
          username: user.username,
          name: user.name,
          email,
          verify: user.verify,
          role: user.role,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  forgetPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        return next(new ErrorHandler(400, "This email is not registered"));
      }
      if (!user.verify) {
        return next(new ErrorHandler(400, "Email not registered"));
      }

      const otp = Math.floor(1000 + Math.random() * 9000);
      let existingOtp = await Otp.findOne({ email });
      if (existingOtp) {
        await existingOtp.updateOne({ otp });
      } else {
        let newOtp = new Otp({
          email,
          otp,
        });
        await newOtp.save();
      }
      sendmail(email, otp);

      res.json({
        success: true,
        message: "otp is send to your registered email",
      });
    } catch (e) {
      next(e);
    }
  },

  verifyOtp: async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      let OTP = await Otp.findOne({ email });
      if (otp != OTP?.otp) {
        return next(new ErrorHandler(400, "Invalid otp"));
      }
      Otp.deleteOne({ email });
      let user = await User.findOne({ email });
      const token = jwt.sign({ id: user._id }, process.env.RESET, {
        expiresIn: 600,
      });
      console.log(token);

      res.json({
        success: true,
        message: "otp is validated",
        data: {
          userId: user._id,
          token,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  resendOtp: async (req, res, next) => {
    try {
      const { email } = req.body;

      const otp = Math.floor(1000 + Math.random() * 9000);
      let existingOtp = await Otp.findOne({ email });

      if (existingOtp) {
        await existingOtp.updateOne({ otp, createdAt: Date.now });
      } else {
        const newOtp = new Otp({
          email,
          otp,
        });
        await newOtp.save();
      }

      sendmail(email, otp);

      res.json({
        success: true,
        message: "New OTP has been sent to your registered email",
      });
    } catch (e) {
      next(e);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { newPassword } = req.body;
      const token = req.header("auth-token");
      const verified = jwt.verify(token, process.env.RESET);
      if (!verified) {
        return next(new ErrorHandler(400, "Please verify otp first"));
      }
      let hashedPassword = await bcryptjs.hash(newPassword, 8);
      const uid = shortid.generate();
      await User.findByIdAndUpdate(verified.id, {
        shortId: uid,
        password: hashedPassword,
      });
      res.json({
        success: true,
        message: "password has been changed successfully",
      });
    } catch (e) {
      next(e);
    }
  },
};
module.exports = authCtrl;

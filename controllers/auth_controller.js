const bcryptjs = require("bcryptjs");
const sendmail = require("../utils/mailer");
const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("../middlewares/error");
const { authSchema } = require("../utils/validator");
const { User, Otp } = require("../models");
require("dotenv").config();

const authCtrl = {
  signUp: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);
      console.log(result);
      const username = result.username;
      const email = result.email;
      const password = result.password;

      // let existingOtp = await Otp.findOne({ email });
      // if (existingOtp) {
      //   await Otp.deleteOne({ email });
      // }

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
        let user = new User({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          username,
          email,
          password: hashedPassword,
        });

        user.save();
      }

      // user = await user.save();
      // OTP = OTP.save();
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
      if (!user.verify) {
        // return res.status(401).json({ msg: "Email is not verified" });
        return next(new ErrorHandler(401, "Email is not verified"));
      }
      const token = jwt.sign({ id: user._id }, process.env.USER, {
        expiresIn: "2d",
      });
      // console.log(token);
      res.json({
        success: true,
        message: "User signed successfully",
        data: {
          token,
          username: user.username,
          email,
          verify: user.verify,
          role: user.role,
        },
      });
    } catch (e) {
      //   res.status(500).json({ error: e.message });
      next(e);
    }
  },

  forgetPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        // return res.status(400).json({ error: "This email is not registered" });
        return next(new ErrorHandler(400, "This email is not registered"));
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
      //   res.status(500).json({ error: e.message });
      next(e);
    }
  },

  verifyOtp: async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      let OTP = await Otp.findOne({ email });
      if (otp != OTP?.otp) {
        // return res.status(400).json({ msg: "Invalid otp" });
        return next(new ErrorHandler(400, "Invalid otp"));
      }
      Otp.deleteOne({ email });
      let user = await User.findOne({ email });
      const token = jwt.sign({ id: user._id }, process.env.RESET, {
        expiresIn: 600,
      });
      console.log(token);

      // let token = await Token.findOne({ userId: user._id });
      // if (token) {
      //   await token.deleteOne();
      // }
      // let resetToken = crypto.randomBytes(32).toString("hex");
      // const hash = await bcryptjs.hash(resetToken, 8);
      // await new Token({
      //   userId: user._id,
      //   token: hash,
      // }).save();

      res.json({
        success: true,
        message: "otp is validated",
        data: {
          userId: user._id,
          token,
        },
      });
    } catch (e) {
      //   res.status(500).json({ error: e.message });
      next(e);
    }
  },

  resendOtp: async (req, res, next) => {
    try {
      // console.log("req.body", req.body);
      const { email } = req.body;
      let user = await User.findOne({ email });

      if (!user) {
        return next(
          new ErrorHandler(400, "User with this email does not exist")
        );
      }

      const otp = Math.floor(1000 + Math.random() * 9000);
      let existingOtp = await Otp.findOne({ email });

      if (existingOtp) {
        await existingOtp.updateOne({ otp });
      } else {
        const newOtp = new Otp({
          email,
          otp,
        });
        await newOtp.save();
      }
      // console.log('otp', otp);
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
      const { email, token, newPassword } = req.body;

      // let user = await User.findOne({ email });
      // if (!user.verify) {
      //   return next(new ErrorHandler(403, "Please verify with otp first"));
      // }
      // let passwordResetToken = await Token.findOne({ userId });
      // if (!passwordResetToken) {
      //   return next(
      //     new ErrorHandler(400, "Token is expired,please verify otp again")
      //   );
      // }
      // const isValid = await bcryptjs.compare(token, passwordResetToken.token);
      // if (!isValid) {
      //   return next(new ErrorHandler(400, "Please verify otp first"));
      // }
      const verified = jwt.verify(token, process.env.RESET);
      if (!verified) {
        return next(new ErrorHandler(400, "Please verify otp first"));
      }
      let hashedPassword = await bcryptjs.hash(newPassword, 8);
      await User.findOneAndUpdate({ email }, { password: hashedPassword });
      res.json({
        success: true,
        message: "password has been changed successfully",
      });
    } catch (e) {
      //   res.status(500).json({ error: e.message });
      next(e);
    }
  },
};
module.exports = authCtrl;

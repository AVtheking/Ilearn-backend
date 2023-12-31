const Razorpay = require("razorpay");
require("dotenv").config();

var crypto = require("crypto");
const { ErrorHandler } = require("../middlewares/error");
const { User, Course } = require("../models");
const {  amountSchema } = require("../utils/validator");

const paymentCtrl = {
  buycourse: async (req, res, next) => {
    try {
      const user = req.user;
      const courseId = req.params.courseId;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(400, "No course found"));
      }
      if (course.isPublished == false) {
        return next(new ErrorHandler(400, "Course is not published"));
      }
      const courseIdIndex = user.ownedCourse.findIndex((course) =>
        course.courseId.equals(courseId)
      );
      if (course.createdBy.equals(user._id)) {
        return next(new ErrorHandler(400, "You cannot buy your own course"));
      }
      if (courseIdIndex != -1) {
        return next(
          new ErrorHandler(402, "You have already enrolled in this course")
        );
      }
      const amount = parseInt(course.price);
      if (user.wallet < amount) {
        return next(new ErrorHandler(402, "Insufficient balance"));
      }
      user.wallet -= amount;
      const creater = course.createdBy;
      const createrUser = await User.findById(creater);
      console.log(course.price)
      createrUser.wallet += amount * 0.9;
      await createrUser.save();
      user.ownedCourse.push({ courseId: courseId });
      await user.save();

      await Course.findByIdAndUpdate(courseId, {
        $inc: { totalStudents: 1 },
      });
      return res.json({
        success: true,
        message: "Payment successful",
      });
    } catch (e) {
      next(e);
    }
  },
  buyCourseCart: async (req, res, next) => {
    try {
      const user = req.user;
      const amount = parseInt(req.params.amount);
      console.log(amount)
      const result = await amountSchema.validateAsync({amount})
      const price = result.amount
      console.log(price)
      if (user.cart.length == 0) {
        return next(new ErrorHandler(404, "No course in cart"));
      }
      if (user.wallet < price) {
        return next(new ErrorHandler(402, "Insufficient balance"));
      }
      for (let i = 0; i < user.cart.length; i++) {
        const courseId = user.cart[i];
  
        const course = await Course.findById(courseId);
        const createdBy = course.createdBy;
        const createrUser = await User.findById(createdBy);
        createrUser.wallet += parseInt(course.price) * 0.9;
        await createrUser.save();
        user.ownedCourse.push({ courseId: courseId });
        await Course.findByIdAndUpdate(courseId, {
          $inc: { totalStudents: 1 },
        });
      }
      user.wallet -= price;
      user.cart = [];
      await user.save();
      res.json({
        success: true,
        message: "Payment successful",
      });
    } catch (e) {
      next(e);
    }
  },
 
  createOrder: async (req, res, next) => {
    try {
   
      const amount = parseInt(req.params.amount);
      const result =await amountSchema.validateAsync({amount})
      const price = result.amount
      const razorpayInstance = new Razorpay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.KEY_SECRET,
      });

      const options = {
        amount: price * 100,
        currency: "INR",
        partial_payment: false,
        payment_capture: 1,
      };

      const order = await razorpayInstance.orders.create(options);

      return res.json({
        success: true,
        message: "Order Created",

        order_id: order.id,
        key_id: process.env.KEY_ID,
        createdAt: Date.now(),
        order: order,
      });
    } catch (error) {
      next(error);
    }
  },

  checkPayment: async (req, res, next) => {
    try {
      const amount = parseInt(req.params.amount);
      const result =await amountSchema.validateAsync({amount})
      const price = result.amount
      
      const user = req.user;
      body = req.body.order_id + "|" + req.body.payment_id;
      var expectedSignature = crypto
        .createHmac("sha256", process.env.KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      console.log("sig" + req.body.signature);
      console.log("sig" + expectedSignature);

      if (expectedSignature === req.body.signature) {
        user.wallet+=price;
        await user.save();
        return res.json({
          success: true,
          message: "Payment successful",
        });
      } else {
      
        return next(new ErrorHandler(400, "Payment failed"));
      }
    } catch (error) {
      next(error);
    }
  },
};
module.exports = paymentCtrl;

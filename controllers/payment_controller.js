const Razorpay = require("razorpay");
require("dotenv").config();

var crypto = require("crypto");
const { ErrorHandler } = require("../middlewares");
const { User, Course } = require("../models");
const { courseIdSchema } = require("../utils/validator");

const paymentCtrl = {
  createOrderCart: async (req, res, next) => {
    try {
      const user = req.user;
      if(user.cart.length==0){
        return next(new ErrorHandler(400, "No course in cart"));
      }
      const amount = req.params.amount;
      const razorpayInstance = new Razorpay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.KEY_SECRET,
      });
      const options = {
        amount: amount * 100,
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
      
    }
    catch (e) {
      next(e)
    }
  },
  checkPaymentCart: async (req, res, next) => {
    try {
      body = req.body.order_id + "|" + req.body.payment_id;
      var expectedSignature = crypto
        .createHmac("sha256", process.env.KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      console.log("sig" + req.body.signature);
      console.log("sig" + expectedSignature);
      const user = req.user;
      if (expectedSignature === req.body.signature) {
        for (let i = 0; i < user.cart.length; i++) {
          const courseId = user.cart[i];
          await Course.findByIdAndUpdate(courseId, {
            $inc: { totalStudents: 1 },
          });
          await User.findByIdAndUpdate(req.user._id, {
            $push: { ownedCourse: { courseId: courseId } },
          });
        }
        await User.findByIdAndUpdate(req.user._id, {
          $set: { cart: [] },
        });
        return res.json({
          success: true,
          message: "Payment successful",
        });
      } else {
      
        return next(new ErrorHandler(402, "Payment failed"));
      }
    }
    catch (e) {
      next(e)
    }

  },
  createOrder: async (req, res, next) => {
    try {
      const courseid = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(400, "No course found"));
      }
      const amount = course.price;

      const razorpayInstance = new Razorpay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.KEY_SECRET,
      });

      const options = {
        amount: amount * 100,
        currency: "INR",
        partial_payment: false,
        payment_capture: 1,
      };

      const order = await razorpayInstance.orders.create(options);
      //   console.log(order);
      return res.json({
        success: true,
        message: "Order Created",

        order_id: order.id,
        key_id: process.env.KEY_ID,
        createdAt: Date.now(),
        order: order,
      });
    } catch (error) {
      //   console.log(error);
      next(error);
    }
  },

  checkPayment: async (req, res, next) => {
    try {
    
      const courseid = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const user = req.user;
      body = req.body.order_id + "|" + req.body.payment_id;
      var expectedSignature = crypto
        .createHmac("sha256", process.env.KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      console.log("sig" + req.body.signature);
      console.log("sig" + expectedSignature);

      if (expectedSignature === req.body.signature) {
        const cartCourseIndex = user.cart.indexOf(courseId);
        if (cartCourseIndex != -1) {
          user.cart.splice(cartCourseIndex, 1);
          await user.save();
        }
        await Course.findByIdAndUpdate(courseId, {
          $inc: { totalStudents: 1 },
        });
        await User.findByIdAndUpdate(req.user._id, {
          $push: { ownedCourse: { courseId: courseId } },
        });
        return res.json({
          success: true,
          message: "Payment successful",
        });
      } else {
        // console.log("Payment failed");
        return next(new ErrorHandler(400, "Payment failed"));
      }
    } catch (error) {
     
      next(error);
    }
  },
};
module.exports = paymentCtrl;

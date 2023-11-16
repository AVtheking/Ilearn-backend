const Razorpay = require("razorpay");
require("dotenv").config();

var crypto = require("crypto");
const { ErrorHandler } = require("../middlewares");
const { User, Course } = require("../models");
const { courseIdSchema } = require("../utils/validator");

const paymentCtrl = {
  createOrder: async (req, res, next) => {
    try {
      const courseid = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      const course = await Course.findById(courseId);
      if (!course) {
        return next(new ErrorHandler(400, "No course found"));
      }
      const amount = req.body.amount;

      const razorpayInstance = new Razorpay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.KEY_SECRET,
      });
      //   //   console.log(razorpayInstance);
      //   console.log(process.env.KEY_SECRET);
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
      //   console.log("inside checkPayment");
      // console.log(`req.body.order_id is ${req.body.order_id}`)
      // console.log(`req.body.payment_id is ${req.body.payment_id}`)
      const courseid = req.params.courseId;
      const result = await courseIdSchema.validateAsync({ params: courseid });
      const courseId = result.params;
      body = req.body.order_id + "|" + req.body.payment_id;
      var expectedSignature = crypto
        .createHmac("sha256", process.env.KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      console.log("sig" + req.body.signature);
      console.log("sig" + expectedSignature);

      if (expectedSignature === req.body.signature) {
        await Course.findByIdAndUpdate(courseId, {
          $inc: { totalStudents: 1 },
        });
        await User.findByIdAndUpdate(req.user._id, {
          $push: { ownedCourse: { courseId: courseId } },
        });
          return res.json({ 
            success: true, 
            message: "Payment successful"
        });
      } else {
        // console.log("Payment failed");
        return next(new ErrorHandler(400, "Payment failed"));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
module.exports = paymentCtrl;

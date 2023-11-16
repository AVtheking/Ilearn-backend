const Razorpay = require("razorpay");
require("dotenv").config();

var crypto = require("crypto");
const { ErrorHandler } = require("../middlewares");

const paymentCtrl = {
  createOrder: async (req, res, next) => {
    try {
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

      body = req.body.order_id + "|" + req.body.payment_id;
      var expectedSignature = crypto
        .createHmac("sha256", process.env.KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      console.log("sig" + req.body.signature);
      console.log("sig" + expectedSignature);

      if (expectedSignature === req.body.signature) {
        // console.log("Payment successful");
        return res.status(200).json({ status: "success" });
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

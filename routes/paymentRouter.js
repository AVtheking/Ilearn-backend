const express = require("express");
const paymentRouter = express.Router();
const { paymentCtrl } = require("../controllers");
const { auth } = require("../middlewares");


paymentRouter.post("/buyCourse/:courseId", auth, paymentCtrl.buycourse);
paymentRouter.post("/buyCourseCart/:amount", auth, paymentCtrl.buyCourseCart);
paymentRouter.post("/createOrder/:amount", auth, paymentCtrl.createOrder);
// paymentRouter.post("/createOrderCart/:amount", auth, paymentCtrl.createOrderCart);
// paymentRouter.post("/checkPaymentCart", auth, paymentCtrl.checkPaymentCart);

paymentRouter.post("/checkPayment/:courseId",auth, paymentCtrl.checkPayment);

module.exports = paymentRouter;

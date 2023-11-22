const express = require("express");
const paymentRouter = express.Router();
const { paymentCtrl } = require("../controllers");
const { auth } = require("../middlewares");

// paymentRouter.get("/payment", (req, res)=>{
//     res.render("makePayment")
// })

paymentRouter.post("/createOrder/:courseId", auth, paymentCtrl.createOrder);
paymentRouter.post("/createOrderCart/:amount", auth, paymentCtrl.createOrderCart);
paymentRouter.post("/checkPaymentCart", auth, paymentCtrl.checkPaymentCart);

paymentRouter.post("/checkPayment/:courseId",auth, paymentCtrl.checkPayment);

module.exports = paymentRouter;

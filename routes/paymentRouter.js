const express = require("express");
const paymentRouter = express.Router();
const {paymentCtrl} = require("../controllers");


// paymentRouter.get("/payment", (req, res)=>{
//     res.render("makePayment")
// })

paymentRouter.post("/createOrder" , paymentCtrl.createOrder)

paymentRouter.post("/checkPayment",paymentCtrl.checkPayment)

module.exports = paymentRouter;
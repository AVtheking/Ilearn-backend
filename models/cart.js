const mongoose = require('mongoose')
const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    courseId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    }
})
const cart = new mongoose.model("cart", cartSchema)
module.exports = cart;

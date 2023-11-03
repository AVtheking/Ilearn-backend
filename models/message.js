const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
const Message = new mongoose.model("Message", messageSchema);
module.exports=Message

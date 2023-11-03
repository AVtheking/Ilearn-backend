const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
    },

    text: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const Message = new mongoose.model("Message", messageSchema);
module.exports = Message;

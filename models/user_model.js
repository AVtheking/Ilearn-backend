const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  first_name: {
    type: String,
    
  },
  last_name: {
    type:String
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: "user",
  },
});
const User = new mongoose.model("users", userSchema);
module.exports = User;

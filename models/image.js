const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    name: String,
    image: {
      data: Buffer,
      type: String,
      required :true,
    },
  });
  
  const Image = mongoose.model("Image", imageSchema);
  module.exports = Image;
  
const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  courses: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
});
const Category = new mongoose.model("Category", categorySchema);
module.exports = Category;

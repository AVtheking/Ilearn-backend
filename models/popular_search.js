const mongoose = require("mongoose");

const popularSearchSchema = new mongoose.Schema({
  search: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 1,
  },
});
const PopularSearch = mongoose.model("PopularSearch", popularSearchSchema);
module.exports = PopularSearch;

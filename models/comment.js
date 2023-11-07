const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: String,
  user: String,
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
});
const Comment = mongoose.model('Comment', commentSchema);
module.exports =  Comment;

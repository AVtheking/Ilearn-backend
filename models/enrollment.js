const mongoose = require('mongoose'); //remove it 

const enrollmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Enrollment =mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
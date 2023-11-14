const Comment = require('../models/comment');

const commentCtrl = {
     createComment :async (req, res, next) => {
  try{       
    const { text, user, courseId } = req.body;
     if (!text || !user || !courseId) {
   // return res.status(400).json({ error: 'Text, user, and course ID are required fields.' }); 
      return next(new ErrorHandler(400, "Text ,User and CourseId are required."));
      
  }

    const newComment = new Comment({ text, user, courseId });

    newComment.save((err, comment) => {
    if (err) {
       return next(new ErrorHandler(500, "Could not sve the comment."));
    // return res.status(500).json({ error: 'Could not save the comment.' });
    }
   // res.status(201).json(comment);
    return next(new ErrorHandler(201, "Comment"));
        
  });
  }catch(error){
    next(error);
  }
},
   getCommentsForCourse :async (req, res, next) => {
  try {
    const comments = await Comment.find({ courseId: req.params.courseId });
    res.json(comments);
  } catch (err) {
    next(err);
  }
},
};
module.exports = commentCtrl;

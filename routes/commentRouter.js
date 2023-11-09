const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comment_controlller');
const commentRouter =express.Router(); 

commentRouter.post('/comment', commentsController.createComment);
//commentRouter.get('/:courseId', commentsController.getCommentsForCourse);
commentRouter.get('/course/:courseId/comments',  commentsController.getCommentsForCourse);

module.exports = commentRouter;

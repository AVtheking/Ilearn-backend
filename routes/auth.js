const express = require('express');
const authRouter = express.Router();
const { userSignUp, userLogin } = require('../controllers/authController');
const authenticateUser = require('../middleware/authMiddleware');

authRouter.post('/signup', signupRouter);
authRouter.post('/login',loginRouter);

module.exports = authRouter;

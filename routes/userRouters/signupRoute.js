const express =require("express");
const { userSignUp } = require("../../controllers/userController");

const signupRouter = express.Router();

signupRouter.post('/', async function(req, res) {
    await userSignUp(req, res);
})

module.exports = signupRouter;


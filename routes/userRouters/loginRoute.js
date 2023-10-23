const express =require("express");
const { userLogin } = require("../../controllers/userController");

const loginRouter = express.Router();

loginRouter.get('/', async function(req, res) {
    await userLogin(req, res);
})

module.exports = loginRouter;
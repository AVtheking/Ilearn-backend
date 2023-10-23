const express =require("express");
const { resetPassword } = require("../../controllers/userController");

const resetPassRoute= express.Router();

resetPassRoute.post('/', async function(req, res) {
    await resetPassword(req, res);
})
module.exports = resetPassRoute;
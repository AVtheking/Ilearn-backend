const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("./error");
const { User } = require("../models");
const auth = async (req, res, next) => {
  try {
    const token = req.header("auth-tokaen");
    if (!token) {
      return next(new ErrorHandler(400, "No Token"));
    }
   jwt.verify(
      token,
      process.env.USER,
      async (err, payload) => {
        if (err) {
          return next(new ErrorHandler(401, "Invalid Token"));
        }
        const id = payload.id;
        const uid = payload.uid;
        let user = await User.findById({ _id: id });
        if (!user) {
          return next(new ErrorHandler(400, "Failed to find user from token"));
        }
        if (user.shortId != uid) {
          return next(new ErrorHandler(400, "Login again"));
        }
        req.user = user;
        next();
      }
    );
  } catch (err) {
    next(err);
  }
};
module.exports = auth;

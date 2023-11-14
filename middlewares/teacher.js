const { User } = require("../models");
const { ErrorHandler } = require("./error");
const jwt = require("jsonwebtoken");

const teacher = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    if (!token) {
      return next(new ErrorHandler(400, "No Token"));
    }
    token = token.replace(/^Bearer\s+/, "");
    jwt.verify(token, process.env.USER, async (err, payload) => {
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
      if (user.role != "teacher") {
        return next(new ErrorHandler(400, "You are not a teacher"));
      }
      req.user = user;
      next();
    });
  } catch (e) {
    next(e);
  }
};

const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("./error");
const { User } = require("../models");
// const redis = require("redis");
// const redisClient = redis.createClient();
// redisClient.connect().catch(console.error);
const auth = async (req, res, next) => {
  try {
    let token;
    if (req.headers["authorization"]) {
      token = req.headers["authorization"];
    }

    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return next(new ErrorHandler(401, "No Token"));
    }

    token = token.replace(/^Bearer\s+/, "");

    jwt.verify(token, process.env.USER, async (err, payload) => {
      if (err) {
        return next(new ErrorHandler(401, "Invalid Token"));
      }
      // const key = "userdata";
      const id = payload.id;
      const uid = payload.uid;
      // const data = await redisClient.get(key);
      let user;

      user = await User.findById({ _id: id });
      // redisClient.setEx(key, 3600, JSON.stringify(user));

      if (!user) {
        return next(new ErrorHandler(400, "Failed to find user from token"));
      }
      if (user.shortId != uid) {
        return next(new ErrorHandler(400, "Login again"));
      }
      req.user = user;
      // console.log(user);
      next();
    });
  } catch (err) {
    next(err);
  }
};
module.exports = auth;

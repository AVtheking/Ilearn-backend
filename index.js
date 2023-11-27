const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { errorMiddleware } = require("./middlewares/error");

const {
  authRouter,
  teacherRouter,
  courseRouter,
  userRouter,
  paymentRouter,
} = require("./routes");

require("dotenv").config();

const app = express();
const http = require("http");
const server = http.createServer(app);

const initializedSocket = require("./utils/socket");
const { Course, Video, Category } = require("./models");
// const { Course, Video, Category } = require("./models");

app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.static("public"));
app.set("view engine", "ejs");
app.get("/upload", async (req, res) => {
  res.render("upload");
});
app.get("/payment", async (req, res) => {
  res.render("makePayment");
});
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(errorMiddleware);
app.use(authRouter, errorMiddleware);
app.use(teacherRouter, errorMiddleware);
app.use(courseRouter, errorMiddleware);
app.use(userRouter, errorMiddleware);
app.use(paymentRouter, errorMiddleware);


const PORT = process.env.PORT || 5000;

// socket connection here
initializedSocket(server);

mongoose.connect(process.env.DB).then(() => {
  console.log("connection is successful");
  server.listen(PORT, "0.0.0.0", () => {
    // Course.deleteMany({isPublished:false}).then(() => {
    //   console.log("deleted all courses");
    // }
    // );
    console.log(`Server is running on port ${PORT}`);
  });
});

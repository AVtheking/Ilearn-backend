const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { errorMiddleware } = require("./middlewares/error");

const { authRouter, teacherRouter, courseRouter } = require("./routes");

require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.static("public"));
app.set("view engine", "ejs");
app.get("/", async (req, res) => {
  res.render("upload");
});
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(errorMiddleware);
app.use(authRouter, errorMiddleware);
app.use(teacherRouter, errorMiddleware);
app.use(courseRouter, errorMiddleware);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.DB).then(() => {
  console.log("connection is successful");
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

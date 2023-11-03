const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { errorMiddleware } = require("./middlewares/error");

const { authRouter, teacherRouter, courseRouter } = require("./routes");

require("dotenv").config();

const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { Message } = require("./models");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

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

//socket connection here
io.on("connection", (socket) => {
  console.log(`A socket connection to the server has been made: ${socket.id}`);
  socket.on("message", async (message) => {
    console.log("received a message", message);
    const { text, userId } = message;
    let message = new Message({
      text,
      user: userId,
    });
    message = await message.save();
    io.emit("message", message);
  });
});

mongoose.connect(process.env.DB).then(() => {
  console.log("connection is successful");
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

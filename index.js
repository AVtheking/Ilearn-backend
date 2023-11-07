const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { errorMiddleware } = require("./middlewares/error");

const { authRouter, teacherRouter, courseRouter, imageRouter, commentRouter } = require("./routes");

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
// app.get("/upload", async (req, res) => {
//   res.render("upload");
// });
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(errorMiddleware);
app.use(authRouter, errorMiddleware);
app.use(teacherRouter, errorMiddleware);
app.use(courseRouter, errorMiddleware);
app.use(imageRouter,errorMiddleware);
app.use(commentRouter,errorMiddleware);

const PORT = process.env.PORT || 5000;

//socket connection here
io.on("connection", (socket) => {
  console.log(`A socket connection to the server has been made: ${socket.id}`);
  socket.on("joinCourseChat", (courseId) => {
    socket.join(courseId);
    socket.emit("chatMessage", {
      text: `Welcome to the chat for course ${courseId}`,
      sender: "System",
    });

    socket.on("sendMessage", async (message) => {
      const chatMessage = new Message({
        courseId,
        text: message.text,
        user: message.user,
      });
      await chatMessage.save();

      io.to(courseId).emit("chatMessage", chatMessage);
    });
  });
  // socket.on("message", async (msg) => {
  //   console.log("received a message", msg);
  //   const { text, userId } = msg;
  //   let message = new Message({
  //     text,
  //     user: userId,
  //   });
  //   message = await message.save();
  //   io.emit("message", msg);
  // });
});

mongoose.connect(process.env.DB).then(() => {
  console.log("connection is successful");
  server.listen(PORT, "0.0.0.0", () => {
   console.log(`Server is running on port ${PORT}`);
  //server.listen(PORT, () => {
    //console.log(`Server is running on port ${PORT}`);
  });
});

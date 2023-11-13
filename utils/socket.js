const { Server } = require("socket.io");
const Message = require("../models");

const initializedSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(
      `A socket connection to the server has been made: ${socket.id}`
    );
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
  });
};
module.exports = initializedSocket;

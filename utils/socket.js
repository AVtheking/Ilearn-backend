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
    socket.on("joinCourseChat", async (courseId) => {
      socket.join(courseId);
      try {
        const messageHistory = await Message.aggregate([
          {
            $match: {
              courseId: courseId,
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $project: {
              _id: 1,
              text: 1,
              createdAt: 1,
              user: {
                _id: 1,
                username: 1,
              },
            },
          },
        ]);
        socket.emit("messageHistory", messageHistory);
      } catch (e) {
        res.status(500).json({ message: e.message });
      }
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
        try {
          await chatMessage.save();

          io.to(courseId).emit("chatMessage", chatMessage);
        } catch (e) {
          console.log(e);
        }
      });
    });
  });
};
module.exports = initializedSocket;

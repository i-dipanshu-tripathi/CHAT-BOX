const express = require("express");
const app = express();
const cors = require("cors");
const authRouter = require("./controllers/authController");
const userRouter = require("./controllers/userController");
const chatRouter = require("./controllers/chatController");
const messageRouter = require("./controllers/messageController");
const user = require("./models/user");

// ! to use json data as js object
app.use(cors());
app.use(
  express.json({
    limit: "50mb",
  })
);

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// ! use the auth router
app.use("/api/auth", authRouter);
// ! use the user router
app.use("/api/user", userRouter);
// ! use the chat router
app.use("/api/chat", chatRouter);
// ! use the message router
app.use("/api/message", messageRouter);

const onlineUser = [];

// TEST SOCKET CONNECTION FROM CLIENT
io.on("connection", (socket) => {
  socket.on("join-room", (userId) => {
    socket.join(userId);
  });

  socket.once("send-message", (message) => {
    io.to(message.members[0])
      .to(message.members[1])
      .emit("receive-message", message);
  });

  socket.on("clear-unread-messages", (data) => {
    io.to(data.members[0])
      .to(data.members[1])
      .emit("message-count-cleared", data);
  });

  socket.on("user-typing", (data) => {
    io.to(data.members[0]).to(data.members[1]).emit("started-typing", data);
  });

  socket.on("user-login", (userId) => {
    if (!onlineUser.includes(userId)) {
      onlineUser.push(userId);
    }

    socket.emit("online-users", onlineUser);
  });

  socket.on("user-offline", (userId) => {
    onlineUser.splice(onlineUser.indexOf(userId), 1);
    io.emit("online-users-updated", onlineUser);
  });
});

module.exports = server;

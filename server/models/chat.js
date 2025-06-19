const mongoose = require("mongoose");
const users = require("../models/user");

const chatSchema = new mongoose.Schema(
  {
    members: {
      type: [{ type: mongoose.Types.ObjectId, ref: "users" }],
    },
    lastMessage: {
      type: mongoose.Types.ObjectId,
      ref: "messages",
    },
    unreadMessageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("chats", chatSchema);

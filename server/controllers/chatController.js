const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Chat = require("../models/chat");
const Message = require("../models/message");

router.post("/create-new-chat", authMiddleware, async (req, res) => {
  try {
    const chat = new Chat(req.body);
    const savedChat = await chat.save();

    await savedChat.populate("members");

    res.status(201).send({
      message: "Chat created successfully",
      success: true,
      data: savedChat,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      success: false,
    });
  }
});

router.get("/get-all-chats", authMiddleware, async (req, res) => {
  try {
    const allChats = await Chat.find({ members: { $in: req.userId } })
      .populate("members")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).send({
      message: "All the chats fetched successfully",
      success: true,
      data: allChats,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      success: false,
    });
  }
});

router.post("/clear-unread-message", authMiddleware, async (req, res) => {
  try {
    const chatId = req.body.chatId;

    // We want to update the unread message cont in chat collection
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.send({
        message: "No Chat is found with given Chat ID",
      });
    }

    const updateChat = await Chat.findByIdAndUpdate(
      chatId,
      { unreadMessageCount: 0 },
      { new: true }
    )
      .populate("members")
      .populate("lastMessage");
    // we want to update the read property to true in message
    await Message.updateMany({ chatId: chatId, read: false }, { read: true });

    res.send({
      message: "Unread message cleared successfully",
      success: true,
      data: updateChat,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

module.exports = router;

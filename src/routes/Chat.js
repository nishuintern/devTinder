const express = require("express");
const { userAuth } = require("../../middleware/Auth");
const  Chat  = require("../../models/Chat");

const chatRouter = express.Router();

chatRouter.get("/chat:/targetId", userAuth, async (req, res) => {
  const { targetId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetId],
        messages: [],
      });
      await chat.save();
    }
    res.json(chat);
  } catch (error) {
    console.log(error);
  }
});

module.exports = chatRouter;

const User = require("../Models/UserModel");
const Chat = require("../Models/ChatModel");
const Message = require("../Models/MessageModel");
const upload = require('../Middleware/upload'); // Assuming the middleware is in `middlewares/upload.js`
const fs = require('fs');

exports.allMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name email")
            .populate("chat");
        res.status(200).json(messages);
    } catch (error) {
        res.status(400).send(error.message);
    }
}


exports.sendMessage = async (req, res) => {
    const { content, chatId } = req.body;

    if (!chatId && !req.file) {
        return res.status(400).json({ message: "Either content or file must be provided, along with chatId." });
    }

    const newMessage = {
        sender: req.user._id,
        chat: chatId,
    };

    if (content) {
        newMessage.content = content;
    }

    if (req.file) {
        newMessage.file = {
            url: `/uploads/${req.file.filename}`, // Save file path
            type: req.file.mimetype,
            name: req.file.originalname,
        };
    }

    try {
        let message = await Message.create(newMessage);

        message = await message.populate("sender", "name email");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name email",
        });

        await Chat.findByIdAndUpdate(chatId, { latestMsg: message });

        res.status(200).json(message);
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path); // Remove file if error occurs
        }
        res.status(400).json({ message: "Error sending message", error });
    }
};



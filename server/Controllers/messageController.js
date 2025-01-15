const User = require("../Models/UserModel");
const Chat = require("../Models/ChatModel");
const Message = require("../Models/MessageModel");

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

    if (!content || !chatId) {
        return res.status(400).json({ message: "Content and chatId are required" });
    }

    const newMessage = {
        sender: req.user._id,
        content,
        chat: chatId,
    };

    try {
        let message = await Message.create(newMessage);

        // Use the latest .populate() syntax
        message = await message.populate("sender", "name email");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name email",
        });

        await Chat.findByIdAndUpdate(chatId, { latestMsg: message });

        res.status(200).json(message);
    } catch (error) {
        res.status(400).json({ message: "Error sending message", error });
    }
};


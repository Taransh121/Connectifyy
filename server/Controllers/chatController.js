const User = require("../Models/UserModel");
const Chat = require("../Models/ChatModel");

exports.accessChat = async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ message: "UserId is required" });
    }
    try {
        let chat = await Chat.findOne({
            isGroupChat: false, // Ensures it's a one-on-one chat.
            users: { $all: [req.user._id, userId] } // Matches both participants in the users array.
        })
            .populate("users", "-password") // Populates user details, excluding passwords.
            .populate("latestMsg");
        chat = await User.populate(chat, {
            path: "latestMsg.sender",
            select: "name email"
        })
        if (chat) {
            return res.status(200).send(chat);
        }
        // If no chat exists, creates a new one.
        const newChat = await Chat.create({
            chatName: "Private Chat", // Default name for a one-on-one chat.
            isGroupChat: false, // Specifies that this is a one-on-one chat.
            users: [req.user._id, userId] // Includes the logged-in user and the other participant in the `users` array.
        });

        // Populates user details for the newly created chat.
        const fullChat = await Chat.findById(newChat._id).populate("users", "-password");
        res.status(200).send(fullChat);
    } catch (error) {
        res.status(500).send(error.message);
    }
}
exports.fetchChats = async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMsg")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMsg.sender",
                    select: "name email",
                });
                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400).send(error.message);
    }
}
exports.createGroupChat = async (req, res) => {
    const { chatName, users } = req.body;

    if (!users || !chatName) {
        return res.status(400).send({ message: "Group name and users are required" });
    }

    // Parse users and ensure the logged-in user's ID is treated as a string
    const parsedUsers = JSON.parse(users).map(user => user.toString());
    const adminUserId = req.user._id.toString(); // Ensure req.user._id is also a string

    if (parsedUsers.length < 2) {
        return res.status(400).send("A group chat requires at least two users");
    }

    // Remove duplicates, including the logged-in user's ID if passed
    const uniqueUsers = [...new Set(parsedUsers.filter(user => user !== adminUserId))];

    // Add the logged-in user to the group, ensuring they're included only once
    uniqueUsers.push(adminUserId);

    try {
        const groupChat = await Chat.create({
            chatName,
            users: uniqueUsers,
            isGroupChat: true,
            groupAdmin: req.user // Sets the logged-in user as the admin
        });

        // Populate user details for the newly created group chat
        const fullGroupChat = await Chat.findById(groupChat._id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).send(fullGroupChat);
    } catch (error) {
        res.status(400).send(error.message);
    }
};
exports.renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;

    if (!chatId || !chatName) {
        return res.status(400).send("Chat ID and new name are required");
    }

    try {
        // Finds the chat and updates its name.
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { chatName },
            { new: true } // Ensures the updated chat is returned.
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            return res.status(404).send("Chat not found");
        }

        res.status(200).send(updatedChat);
    } catch (error) {
        res.status(500).send(error.message);
    }
}
exports.addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        // Adds the specified user to the group.
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            return res.status(404).send("Chat not found");
        }

        res.status(200).send([updatedChat]);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

exports.removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        // Removes the specified user from the group.
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            return res.status(404).send("Chat not found");
        }

        res.status(200).send([updatedChat]);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
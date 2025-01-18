const express = require("express");
const { protect } = require("../Middleware/auth");
const router = express.Router();
const { accessChat, fetchChats, deleteChat, createGroupChat, renameGroup, removeFromGroup, addToGroup } = require("../Controllers/chatController");

// file storage 

router.post("/", protect, accessChat); // Access or create a one-on-one chat
router.get("/allChats", protect, fetchChats); // Fetch all chats for a user 
router.delete("/deleteChat/:chatId", protect, deleteChat); // Delete a chat by ID
router.post("/createGroup", protect, createGroupChat); // Create a new group chat
router.put("/renameGroup", protect, renameGroup); // Rename a group chat
router.put("/addToGroup", protect, addToGroup); // Add a user to a group chat
router.put("/removeFromGroup", protect, removeFromGroup); // Remove a user from a group chat



module.exports = router;

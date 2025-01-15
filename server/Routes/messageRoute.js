const express = require("express");
const { protect } = require("../Middleware/auth");
const router = express.Router();
const {
    allMessages,
    sendMessage,
} = require("../Controllers/messageController");


router.get("/:chatId", protect, allMessages);
router.post("/", protect, sendMessage);

module.exports = router;
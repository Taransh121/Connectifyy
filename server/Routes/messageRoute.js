const express = require("express");
const { protect } = require("../Middleware/auth");
const router = express.Router();
const {
    allMessages,
    sendMessage,
} = require("../Controllers/messageController");
const upload = require('../Middleware/upload');


router.get("/:chatId", protect, allMessages);
router.post("/", protect, upload.single('file'), sendMessage);

module.exports = router;
const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        trim: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
    file: {
        url: { type: String },
        type: { type: String },
        name: { type: String }
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
}, { timeStamps: true });

module.exports = mongoose.model('Message', messageSchema);
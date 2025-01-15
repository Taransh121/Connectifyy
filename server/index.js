// Imports
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const colors = require("colors");
const http = require("http"); // Required to use Socket.IO
const { Server } = require("socket.io"); // Import Socket.IO
const { notFound, errorHandler } = require("./Middleware/error");

const app = express();
const PORT = 8080;

// Routes
const userRoutes = require("./Routes/userRoute");
const chatRoutes = require("./Routes/chatRoute");
const msgRoutes = require("./Routes/messageRoute");

// Configurations
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Adjust the path based on your structure
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const dirname = path.resolve();

// Database
mongoose.set('strictQuery', false);
const mongoURL = `mongodb+srv://admin:${process.env.MONGO_DB_PASSWORD}@cluster0.1vudx.mongodb.net/Project?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.connect(mongoURL)
    .then(() => {
        console.log("Database connected".green.bold);
    }).catch((error) => {
        console.log(error.red.bold);
    });

// Middleware for Routes
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", msgRoutes);

// Catch all routes that are not found (404)
app.use(notFound);
// Error handler middleware (for 500s or other errors)
app.use(errorHandler);

// Serve static files for the client
app.use(express.static(path.join(dirname, '/client/dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(dirname, 'client', 'dist', 'index.html'));
});

const server = app.listen(
    PORT,
    console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:5173",
        // credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});

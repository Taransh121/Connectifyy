const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");
const Chat = require("../Models/ChatModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Adjust the path based on your structure

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});


exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ msg: "User already exists" });
        } else {

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = new User({
                name, email, password: hashedPassword
            });
            const savedUser = await newUser.save();
            const token = jwt.sign(savedUser.id, process.env.Jwt_Token);
            return res.status(200).json({ token, savedUser });
        }
    } catch (error) {
        return res.status(400).json(error);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ msg: "User does not exists" });
        }
        else {
            const comparePassword = await bcrypt.compare(password, user.password);
            if (!comparePassword) {
                res.status(400).json({ msg: "Invalid credentials" });
            } else {
                //generate a token-
                const token = jwt.sign({ id: user._id }, process.env.Jwt_Token, { expiresIn: '1d' });
                return res.status(200).json({ token, user });
            }
        }
    } catch (error) {
        return res.status(400).json(error);
    }
};

exports.logout = async (req, res) => {
    try {
        res.clearCookie("token")
        res.status(200).json({ msg: "Signout Successfully." })
    } catch (error) {
        return res.status(400).json(error);
    }
}

exports.allusers = async (req, res) => {
    try {
        const keyword = req.query.search ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } }
            ]
        } : {}
        const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
        res.status(200).send(users);
    } catch (error) {
        return res.status(400).json(error);

    }
}
exports.allGroups = async (req, res) => {
    try {
        const keyword = req.query.search
            ? { chatName: { $regex: req.query.search, $options: "i" } }
            : {};

        const groups = await Chat.find({ isGroupChat: true, ...keyword })
            .populate("users", "name email")
            .populate("groupAdmin", "name email");

        res.status(200).json(groups);
    } catch (error) {
        return res.status(400).json({ message: "Error fetching groups", error });
    }
};

// Forgot Password (Send Reset Link)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ msg: "User not found" });

        // Generate JWT (valid for 1 hour)
        const token = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN, { expiresIn: "1h" });

        // Send email with reset link
        const resetLink = `http://localhost:5173/reset-password/${token}`;
        const mailOptions = {
            to: user.email,
            subject: "Password Reset Request",
            html: `<p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
        };

        console.log("Reset Password Token:", token);
        console.log("Sending Email to:", user.email);

        try {
            await transporter.sendMail(mailOptions);
            res.json({ msg: "Password reset link sent to your email." });
        } catch (mailError) {
            console.error("Error sending email:", mailError);
            res.status(500).json({ msg: "Error sending email. Please try again." });
        }
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
};

// Reset Password using JWT
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) return res.status(400).json({ msg: "Password is required" });

        // Verify and decode JWT
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_TOKEN);
        } catch (err) {
            return res.status(400).json({ msg: "Invalid or expired token" });
        }

        const user = await User.findById(decoded.userId);
        if (!user) return res.status(400).json({ msg: "User not found" });

        // Hash and update the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        res.json({ msg: "Password reset successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
};

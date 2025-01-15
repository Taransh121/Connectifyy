const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");

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
const express = require("express");
const { register, login, logout, allusers } = require("../Controllers/AuthController");
const { protect } = require("../Middleware/auth");
const router = express.Router();

// file storage 

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/", protect, allusers);

module.exports = router;

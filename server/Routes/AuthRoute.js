const express = require("express");
const { register, login, logout } = require("../Controllers/AuthController");
const router = express.Router();

// file storage 

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;

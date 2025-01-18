const express = require("express");
const { register, login, logout, allusers, allGroups } = require("../Controllers/AuthController");
const { protect } = require("../Middleware/auth");
const router = express.Router();

// file storage 

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/", protect, allusers);
router.get("/groups", protect, allGroups);

module.exports = router;

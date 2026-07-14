const express = require("express");
const { getUsers, updateUser, deleteUser } = require("../controller/userController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/", authMiddleware, adminMiddleware, getUsers);
router.put("/:id", authMiddleware, adminMiddleware, updateUser);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);
module.exports = router;

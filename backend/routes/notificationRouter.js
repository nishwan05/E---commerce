const express = require("express");
const {
  getMyNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
} = require("../controller/notificationController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getMyNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.patch("/mark-all-read", authMiddleware, markAllRead);
router.patch("/:id/read", authMiddleware, markOneRead);

module.exports = router;

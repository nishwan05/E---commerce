const express = require("express");
const {
  getMessages,
  getConversations,
  getMessagesByTicket,
} = require("../controller/chatController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/conversations", authMiddleware, adminMiddleware, getConversations);
router.get("/tickets/:ticketId", authMiddleware, getMessagesByTicket);
router.get("/:email", authMiddleware, adminMiddleware, getMessages);
module.exports = router;

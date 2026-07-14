const express = require("express");
const { getMessages, getConversations, getMessagesByTicket } = require("../controller/chatController");
const router = express.Router();
router.get("/conversations", getConversations);
router.get("/tickets/:ticketId", getMessagesByTicket);
router.get("/:email", getMessages);
module.exports = router;

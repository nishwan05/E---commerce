const express = require("express");
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  claimTicket,
  closeTicket,
} = require("../controller/ticketController");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();
router.post("/", authMiddleware, createTicket);
router.get("/my", authMiddleware, getMyTickets);
router.get("/", authMiddleware, getAllTickets);
router.get("/:id", authMiddleware, getTicketById);
router.patch("/:id/claim", authMiddleware, claimTicket);
router.patch("/:id/close", authMiddleware, closeTicket);
module.exports = router;

const express = require("express");
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  claimTicket,
  closeTicket,
} = require("../controller/ticketController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();
router.post("/", authMiddleware, createTicket);
router.get("/my", authMiddleware, getMyTickets);
router.get("/", authMiddleware, adminMiddleware, getAllTickets);
router.get("/:id", authMiddleware, getTicketById);
router.patch("/:id/claim", authMiddleware, adminMiddleware, claimTicket);
router.patch("/:id/close", authMiddleware, closeTicket);
module.exports = router;

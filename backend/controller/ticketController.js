const Ticket = require("../models/ticketModel");
const mongoose = require("mongoose");

const createTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;
    const ticket = await Ticket.create({
      userId: req.user.id,
      userName: req.user.name,
      email: req.user.email,
      subject,
      description,
    });
    req.app.get("io")?.emit("ticketCreated", ticket);
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to create ticket" });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: tickets });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch tickets" });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch {
    res.status(500).json({ success: false, message: "Failed" });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    res.json({ success: true, data: ticket });
  } catch {
    res.status(500).json({ success: false, message: "Failed" });
  }
};

const claimTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid ticket id" });
    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, status: "pending" },
      { status: "claimed", claimedBy: userId, claimedByName: req.user.name },
      { returnDocument: "after" },
    );
    if (!ticket) {
      const existingTicket = await Ticket.findById(id);
      if (!existingTicket)
        return res
          .status(404)
          .json({ success: false, message: "Ticket not found" });
      return res
        .status(400)
        .json({ success: false, message: "Ticket is not pending" });
    }
    req.app.get("io")?.emit("ticketUpdated", ticket);
    return res
      .status(200)
      .json({
        success: true,
        message: "Ticket claimed successfully",
        data: ticket,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to claim ticket" });
  }
};

const closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid ticket id" });
    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: id,
        status: { $ne: "closed" },
        $or: [{ userId }, { claimedBy: userId }],
      },
      { status: "closed" },
      { returnDocument: "after" },
    );
    if (!ticket) {
      const existingTicket = await Ticket.findById(id);
      if (!existingTicket)
        return res
          .status(404)
          .json({ success: false, message: "Ticket not found" });
      return res
        .status(403)
        .json({ success: false, message: "You cannot close this ticket" });
    }
    req.app.get("io")?.emit("ticketUpdated", ticket);
    res
      .status(200)
      .json({
        success: true,
        message: "Ticket closed successfully",
        data: ticket,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to close ticket" });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  claimTicket,
  closeTicket,
};

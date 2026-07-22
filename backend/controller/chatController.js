const Chat = require("../models/chatModel");
const Ticket = require("../models/ticketModel");

const getMessages = async (req, res) => {
  try {
    const messages = await Chat.find({ email: req.params.email }).sort({
      createdAt: 1,
    });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const getConversations = async (req, res) => {
  const users = await Chat.aggregate([
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: "$email",
        email: { $last: "$email" },
        name: { $last: "$name" },
        role: { $last: "$role" },
        lastMessageAt: { $last: "$createdAt" },
        lastMessage: { $last: "$message" },
      },
    },
    { $sort: { lastMessageAt: -1 } },
  ]);
  res.json({ success: true, data: users });
};

const getMessagesByTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }
    const isOwner = String(ticket.userId) === String(req.user.id);
    const isAdmin = ["admin", "superadmin"].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const messages = await Chat.find({ ticketId: req.params.ticketId }).sort({
      createdAt: 1,
    });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

module.exports = { getMessages, getConversations, getMessagesByTicket };

const mongoose = require("mongoose");
const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
  status: { type: String, enum: ["pending", "claimed", "closed"], default: "pending" },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  claimedByName: { type: String, default: "" },
  lastMessage: { type: String, default: "" },
  lastMessageAt: { type: Date, default: null },
}, { timestamps: true });
module.exports = mongoose.model("Ticket", ticketSchema);

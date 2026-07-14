require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");

const Chat = require("./models/chatModel");
const Ticket = require("./models/ticketModel");
const logger = require("./utils/logger");

const productRouter = require("./routes/productRouter");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const cartRouter = require("./routes/cartRouter");
const roleRouter = require("./routes/roleRouter");
const pageRoutes = require("./routes/pageRouter");
const chatRouter = require("./routes/chatRouter");
const ticketRouter = require("./routes/ticketRouter");
const permissionRouter = require("./routes/permissionRouter");
const orderRouter = require("./routes/orderRouter");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(cookieParser());

app.use("/api/products", productRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/roles", roleRouter);
app.use("/api/pages", pageRoutes);
app.use("/api/chat", chatRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/permissions", permissionRouter);
app.use("/api/orders", orderRouter);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true },
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    const ticket = await Ticket.findById(data.ticketId);
    if (!ticket || ticket.status === "closed") return;
    if (data.sender === "admin" && ticket.claimedBy?.toString() !== data.adminId) return;
    const message = await Chat.create(data);
    const updatedTicket = await Ticket.findByIdAndUpdate(
      data.ticketId,
      { lastMessage: message.message, lastMessageAt: message.createdAt },
      { returnDocument: "after" }
    );
    io.to(data.ticketId).emit("newMessage", message);
    io.emit("conversationUpdated", { message, ticket: updatedTicket });
  });

  socket.on("joinRoom", (ticketId) => {
    socket.join(ticketId);
    console.log(`Joined room ${ticketId}`);
  });

  socket.on("claimTicket", async ({ ticketId, adminId, adminName }) => {
    if (!mongoose.Types.ObjectId.isValid(ticketId)) return;
    const ticket = await Ticket.findOneAndUpdate(
      { _id: ticketId, status: "pending" },
      { status: "claimed", claimedBy: adminId, claimedByName: adminName },
      { returnDocument: "after" }
    );
    if (!ticket) return;
    io.emit("ticketUpdated", ticket);
  });

  socket.on("closeTicket", async ({ ticketId, userId }) => {
    if (!mongoose.Types.ObjectId.isValid(ticketId)) return;
    const ticket = await Ticket.findOneAndUpdate(
      { _id: ticketId, status: { $ne: "closed" }, $or: [{ userId }, { claimedBy: userId }] },
      { status: "closed" },
      { returnDocument: "after" }
    );
    if (!ticket) return;
    io.emit("ticketUpdated", ticket);
  });

  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

const PORT = process.env.PORT || 5000;
const MONGOOSE_URI = process.env.MONGOOSE_URI;

mongoose
  .connect(MONGOOSE_URI)
  .then(() => {
    logger.info("DB is connected");
    server.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
  })
  .catch((error) => logger.error(error));

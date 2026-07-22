require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const path = require("path");
const jwt = require("jsonwebtoken");

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
const notificationRouter = require("./routes/notificationRouter");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
app.use("/api/notifications", notificationRouter);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);

const parseCookieHeader = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((cookies, part) => {
    const [key, ...valueParts] = part.trim().split("=");
    if (!key) return cookies;
    cookies[key] = decodeURIComponent(valueParts.join("="));
    return cookies;
  }, {});

io.use((socket, next) => {
  const cookies = parseCookieHeader(socket.handshake.headers.cookie);
  const token = cookies.token;
  socket.user = null;
  if (token) {
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      socket.user = null;
    }
  }
  next();
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  if (["admin", "superadmin"].includes(socket.user?.role)) {
    socket.join("admins");
  }

  socket.on("joinUserRoom", (userId) => {
    if (!socket.user || String(socket.user.id) !== String(userId)) return;
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined personal room`);
  });

  socket.on("sendMessage", async (data) => {
    if (!socket.user || !mongoose.Types.ObjectId.isValid(data.ticketId)) return;
    const ticket = await Ticket.findById(data.ticketId);
    if (!ticket || ticket.status === "closed") return;
    const userId = socket.user.id;
    const isAdmin = ["admin", "superadmin"].includes(socket.user.role);
    const isOwner = String(ticket.userId) === String(userId);
    const isAssignedAdmin =
      isAdmin && String(ticket.claimedBy) === String(userId);
    if (!isOwner && !isAssignedAdmin) return;
    const messageText = String(data.message || "").trim();
    if (!messageText) return;
    const message = await Chat.create({
      ticketId: data.ticketId,
      adminId: isAdmin ? userId : null,
      sender: isAdmin ? "admin" : "user",
      name: socket.user.name,
      role: socket.user.role,
      message: messageText,
    });
    const updatedTicket = await Ticket.findByIdAndUpdate(
      data.ticketId,
      { lastMessage: message.message, lastMessageAt: message.createdAt },
      { returnDocument: "after" },
    );
    io.to(data.ticketId).emit("newMessage", message);
    io.emit("conversationUpdated", { message, ticket: updatedTicket });
  });

  socket.on("joinRoom", async (ticketId) => {
    if (!socket.user || !mongoose.Types.ObjectId.isValid(ticketId)) return;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return;
    const isAdmin = ["admin", "superadmin"].includes(socket.user.role);
    const isOwner = String(ticket.userId) === String(socket.user.id);
    if (!isAdmin && !isOwner) return;
    socket.join(ticketId);
    console.log(`Joined room ${ticketId}`);
  });

  socket.on("claimTicket", async ({ ticketId, adminId, adminName }) => {
    if (!["admin", "superadmin"].includes(socket.user?.role)) return;
    if (!mongoose.Types.ObjectId.isValid(ticketId)) return;
    const ticket = await Ticket.findOneAndUpdate(
      { _id: ticketId, status: "pending" },
      {
        status: "claimed",
        claimedBy: socket.user.id,
        claimedByName: socket.user.name || adminName,
      },
      { returnDocument: "after" },
    );
    if (!ticket) return;
    io.emit("ticketUpdated", ticket);
  });

  socket.on("closeTicket", async ({ ticketId, userId }) => {
    if (!socket.user) return;
    if (!mongoose.Types.ObjectId.isValid(ticketId)) return;
    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: ticketId,
        status: { $ne: "closed" },
        $or: [{ userId: socket.user.id }, { claimedBy: socket.user.id }],
      },
      { status: "closed" },
      { returnDocument: "after" },
    );
    if (!ticket) return;
    io.emit("ticketUpdated", ticket);
  });

  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

const PORT = process.env.PORT || 5001;
const MONGOOSE_URI = process.env.MONGOOSE_URI;

if (!MONGOOSE_URI) {
  logger.error("MONGOOSE_URI is not defined. Check backend/.env");
  process.exit(1);
}

mongoose
  .connect(MONGOOSE_URI)
  .then(() => {
    logger.info("DB is connected");
    server.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
  })
  .catch((error) => logger.error(error));

const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Notification = require("../models/notificationModel");

const notify = async (
  io,
  userId,
  { title, message, type = "order", refId },
) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      refId,
    });
    io.to(`user_${userId}`).emit("newNotification", notification);
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};

const placeOrder = async (req, res) => {
  try {
    const { productId, quantity, paymentMode, deliveryDetails } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: productId, isDeleted: false, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true },
    );

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient stock" });
    }

    const io = req.app.get("io");
    io.emit("productUpdated", product);

    const order = await Order.create({
      userId: req.user.id,
      products: [
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        },
      ],
      totalAmount: product.price * quantity,
      paymentMode,
      paymentStatus: paymentMode === "upi" ? "paid" : "pending",
      address: deliveryDetails,
      statusHistory: [{ status: "Placed", updatedBy: req.user.id }],
    });

    io.emit("orderCreated", order);

    await notify(io, req.user.id, {
      title: "Order Placed!",
      message: `Your order for ${product.name} has been placed successfully.`,
      refId: order._id,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Order failed" });
  }
};

const cartCheckout = async (req, res) => {
  try {
    const { items, paymentMode, deliveryDetails } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const io = req.app.get("io");
    const orderProducts = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          isDeleted: false,
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } },
        { new: true },
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `"${item.name}" has insufficient stock`,
        });
      }

      io.emit("productUpdated", product);

      orderProducts.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: item.quantity,
      });

      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      userId: req.user.id,
      products: orderProducts,
      totalAmount,
      paymentMode,
      paymentStatus: paymentMode === "upi" ? "paid" : "pending",
      address: deliveryDetails,
      statusHistory: [{ status: "Placed", updatedBy: req.user.id }],
    });

    io.emit("orderCreated", order);

    await notify(io, req.user.id, {
      title: "Order Placed!",
      message: `Your order with ${orderProducts.length} item(s) has been placed successfully.`,
      refId: order._id,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Checkout failed" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const isOwner = String(order.userId) === String(req.user.id);
    const isAdmin = ["admin", "superadmin"].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "Placed",
      "Confirmed",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot update a cancelled order" });
    }

    if (status === "Cancelled") {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
      order.cancelledBy = "admin";
    }

    order.status = status;
    order.statusHistory.push({ status, updatedBy: req.user.id });
    await order.save();

    const io = req.app.get("io");
    io.emit("orderUpdated", order);

    const statusMessages = {
      Confirmed: "Your order has been confirmed!",
      Packed: "Your order has been packed and is ready for shipment.",
      Shipped: "Your order has been shipped!",
      "Out for Delivery": "Your order is out for delivery. Expect it today!",
      Delivered: "Your order has been delivered. Enjoy!",
      Cancelled: "Your order has been cancelled by the admin.",
    };

    if (statusMessages[status]) {
      await notify(io, order.userId, {
        title: `Order ${status}`,
        message: statusMessages[status],
        refId: order._id,
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (String(order.userId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const nonCancellableStatuses = [
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];
    if (nonCancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is already ${order.status}`,
      });
    }

    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = "Cancelled";
    order.cancelledBy = "user";
    order.cancellationReason = reason || "";
    order.statusHistory.push({ status: "Cancelled", updatedBy: req.user.id });
    await order.save();

    const io = req.app.get("io");
    io.emit("orderUpdated", order);
    io.emit("productUpdated"); 

    res
      .status(200)
      .json({
        success: true,
        message: "Order cancelled successfully",
        data: order,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  placeOrder,
  cartCheckout,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};

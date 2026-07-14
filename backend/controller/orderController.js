const Order = require("../models/orderModel");
const Product = require("../models/productModel");

const placeOrder = async (req, res) => {
  try {
    const { productId, quantity, paymentMode, deliveryDetails } = req.body;
    const product = await Product.findOneAndUpdate(
      { _id: productId, isDeleted: false, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    );
    if (!product) return res.status(400).json({ success: false, message: "Insufficient stock" });
    const io = req.app.get("io");
    io.emit("productUpdated", product);
    const order = await Order.create({
      userId: req.user.id,
      products: [{ productId, name: product.name, price: product.price, quantity }],
      totalAmount: product.price * quantity,
      paymentMode,
      address: deliveryDetails,
    });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Order failed" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const cartCheckout = async (req, res) => {
  try {
    const { items, paymentMode, deliveryDetails } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: "Cart is empty" });
    const io = req.app.get("io");
    const orderProducts = [];
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, isDeleted: false, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!product) return res.status(400).json({ success: false, message: `"${item.name}" has insufficient stock` });
      io.emit("productUpdated", product);
      orderProducts.push({ productId: product._id, name: product.name, price: product.price, quantity: item.quantity });
      totalAmount += product.price * item.quantity;
    }
    const order = await Order.create({ userId: req.user.id, products: orderProducts, totalAmount, paymentMode, address: deliveryDetails });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Checkout failed" });
  }
};

module.exports = { placeOrder, getMyOrders, cartCheckout };

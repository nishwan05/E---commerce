const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 },
  }],
  totalAmount: { type: Number, required: true },
  paymentMode: { type: String, enum: ["cod", "upi"], required: true },
  address: { name: String, mobile: String, address: String, pincode: String },
  status: { type: String, default: "Placed" },
}, { timestamps: true });
module.exports = mongoose.model("Order", orderSchema);

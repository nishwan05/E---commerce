const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 3, trim: true },
    brand: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["mobile", "electronics", "fashion"],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: false },
    description: { type: String, default: "" },
    stock: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Product", productSchema);

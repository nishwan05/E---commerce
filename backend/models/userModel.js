const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, default: "member" },
    isActive: { type: Boolean, default: true },
    cart: {
      type: [
        {
          _id: false,
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          quantity: Number,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("User", userSchema);

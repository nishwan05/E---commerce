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
    profilePicture: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    mobile: { type: String, default: "" },
    address: { type: String, default: "" },
    pincode: { type: String, default: "" },
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

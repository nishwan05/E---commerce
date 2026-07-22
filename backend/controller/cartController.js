const User = require("../models/userModel");
const logger = require("../utils/logger");

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).populate("cart.productId");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user.cart || [] });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal server Error" });
  }
};

const updateCart = async (req, res) => {
  try {
    const { cart } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { cart },
      { returnDocument: "after" },
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const io = req.app.get("io");
    io.to(`user_${req.user.id}`).emit("cartUpdated", { userId: req.user.id });
    res
      .status(200)
      .json({ success: true, message: "Cart synced successfully" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal server Error" });
  }
};

module.exports = { getCart, updateCart };

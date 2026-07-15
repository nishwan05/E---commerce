const User = require("../models/userModel");
const logger = require("../utils/logger");

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    if (req.params.id === req.user?.id)
      return res
        .status(403)
        .json({
          success: false,
          message: "You cannot update your own account",
        });
    const { name, email, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isActive },
      { returnDocument: "after", runValidators: true, select: "-password" },
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const io = req.app.get("io");
    io.emit("userUpdated", user);
    res
      .status(200)
      .json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user?.id)
      return res
        .status(403)
        .json({
          success: false,
          message: "You cannot delete your own account",
        });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getUsers, updateUser, deleteUser };

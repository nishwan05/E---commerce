const express = require("express");
const {
  getPermissions,
  updatePermission,
} = require("../controller/permissionController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/", getPermissions);
router.put("/", authMiddleware, adminMiddleware, updatePermission);
module.exports = router;

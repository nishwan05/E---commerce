const express = require("express");
const {
  getPermissions,
  updatePermission,
} = require("../controller/permissionController");
const {
  authMiddleware,
  superAdminMiddleware,
} = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/", getPermissions);
router.put("/", authMiddleware, superAdminMiddleware, updatePermission);
module.exports = router;

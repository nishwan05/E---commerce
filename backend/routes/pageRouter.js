const express = require("express");
const {
  getPages,
  createPage,
  updatePage,
  deletePage,
} = require("../controller/pageController");
const {
  authMiddleware,
  superAdminMiddleware,
} = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/", getPages);
router.post("/", authMiddleware, superAdminMiddleware, createPage);
router.put("/:id", authMiddleware, superAdminMiddleware, updatePage);
router.delete("/:id", authMiddleware, superAdminMiddleware, deletePage);
module.exports = router;

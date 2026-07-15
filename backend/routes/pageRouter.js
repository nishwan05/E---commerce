const express = require("express");
const {
  getPages,
  createPage,
  updatePage,
  deletePage,
} = require("../controller/pageController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/", getPages);
router.post("/", authMiddleware, adminMiddleware, createPage);
router.put("/:id", authMiddleware, adminMiddleware, updatePage);
router.delete("/:id", authMiddleware, adminMiddleware, deletePage);
module.exports = router;

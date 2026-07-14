const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getBrands,
  purchaseProducts,
} = require("../controller/productController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

router.get("/brands", getBrands);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  createProduct,
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  updateProduct,
);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);
router.post("/purchase", authMiddleware, purchaseProducts);
module.exports = router;

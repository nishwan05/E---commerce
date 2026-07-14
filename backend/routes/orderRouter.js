const express = require("express");
const { placeOrder, getMyOrders, cartCheckout } = require("../controller/orderController");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();
router.post("/", authMiddleware, placeOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.post("/cart-checkout", authMiddleware, cartCheckout);
module.exports = router;

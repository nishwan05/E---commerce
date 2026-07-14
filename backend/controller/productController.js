const Product = require("../models/productModel");
const logger = require("../utils/logger");

const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }
    const product = await Product.create(productData);
    const io = req.app.get("io");
    io.emit("productCreated", product);
    res
      .status(201)
      .json({
        success: true,
        message: "Product added successfully",
        data: product,
      });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getProducts = async (req, res) => {
  try {
    const { category, search, brands, minPrice, maxPrice } = req.query || {};
    const filter = { isDeleted: false };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    if (brands) {
      const brandList = String(brands)
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
      if (brandList.length > 0) filter.brand = { $in: brandList };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res
      .status(200)
      .json({
        success: true,
        count: products?.length || 0,
        data: products || [],
      });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      updateData,
      { returnDocument: "after", runValidators: true },
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    const io = req.app.get("io");
    io.emit("productUpdated", product);
    res
      .status(200)
      .json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { returnDocument: "after" },
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
    const io = req.app.get("io");
    io.emit("productDeleted", req.params.id);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getBrands = async (req, res) => {
  try {
    const { category } = req.query || {};
    const filter = { isDeleted: false };
    if (category) filter.category = category;
    const brands = await Product.distinct("brand", filter);
    res.status(200).json({ success: true, data: brands?.sort() || [] });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const purchaseProducts = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "No products selected" });
    const updatedProducts = [];
    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true },
      );
      if (!product)
        return res
          .status(400)
          .json({
            success: false,
            message: `${item.productName} has insufficient stock`,
          });
      updatedProducts.push(product);
    }
    const io = req.app.get("io");
    io.emit("stockUpdated", updatedProducts);
    return res
      .status(200)
      .json({
        success: true,
        message: "Purchase successful",
        data: updatedProducts,
      });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Purchase failed" });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getBrands,
  purchaseProducts,
};

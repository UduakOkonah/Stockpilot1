const Product = require("../models/Product");
const Activity = require("../models/Activity");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      quantity,
      price,
      reorderLevel,
      supplier,
      description,
    } = req.body;

    const normalizedSku = sku?.trim().toUpperCase();

    const existingProduct = await Product.findOne({
      user: req.user._id,
      sku: normalizedSku,
    });

    if (existingProduct) {
      return res.status(400).json({
        message: "A product with this SKU already exists",
      });
    }

    const product = await Product.create({
      user: req.user._id,
      name: name?.trim(),
      sku: normalizedSku,
      category: category?.trim(),
      quantity: Number(quantity),
      price: Number(price),
      reorderLevel:
        reorderLevel === "" || reorderLevel === undefined
          ? 5
          : Number(reorderLevel),
      supplier: supplier?.trim() || "",
      description: description?.trim() || "",
    });

    await Activity.create({
      user: req.user._id,
      action: "CREATE",
      productName: product.name,
      sku: product.sku,
      change: `Created product with quantity ${product.quantity}`,
    });

    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "A product with this SKU already exists. If this is a new user, drop the old sku_1 index in MongoDB Atlas and keep user_1_sku_1.",
      });
    }

    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      sku,
      category,
      quantity,
      price,
      reorderLevel,
      supplier,
      description,
    } = req.body;

    const normalizedSku = sku?.trim().toUpperCase();

    const product = await Product.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingSkuProduct = await Product.findOne({
      user: req.user._id,
      sku: normalizedSku,
      _id: { $ne: id },
    });

    if (existingSkuProduct) {
      return res.status(400).json({
        message: "Another product with this SKU already exists",
      });
    }

    const oldQuantity = product.quantity;
    const oldPrice = product.price;
    const oldCategory = product.category;
    const oldName = product.name;

    product.name = name?.trim();
    product.sku = normalizedSku;
    product.category = category?.trim();
    product.quantity = Number(quantity);
    product.price = Number(price);
    product.reorderLevel =
      reorderLevel === "" || reorderLevel === undefined
        ? 5
        : Number(reorderLevel);
    product.supplier = supplier?.trim() || "";
    product.description = description?.trim() || "";

    const updatedProduct = await product.save();

    const changes = [];

    if (oldName !== updatedProduct.name) {
      changes.push(`name changed from "${oldName}" to "${updatedProduct.name}"`);
    }

    if (oldCategory !== updatedProduct.category) {
      changes.push(
        `category changed from "${oldCategory}" to "${updatedProduct.category}"`
      );
    }

    if (oldPrice !== updatedProduct.price) {
      changes.push(`price changed from ${oldPrice} to ${updatedProduct.price}`);
    }

    if (oldQuantity !== updatedProduct.quantity) {
      changes.push(
        `quantity changed from ${oldQuantity} to ${updatedProduct.quantity}`
      );
    }

    await Activity.create({
      user: req.user._id,
      action: "UPDATE",
      productName: updatedProduct.name,
      sku: updatedProduct.sku,
      change:
        changes.length > 0
          ? changes.join(", ")
          : "Product details were updated",
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Another product with this SKU already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Activity.create({
      user: req.user._id,
      action: "DELETE",
      productName: product.name,
      sku: product.sku,
      change: "Product removed from inventory",
    });

    await Product.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
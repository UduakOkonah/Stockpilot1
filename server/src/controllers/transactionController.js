const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const Activity = require("../models/Activity");

const createTransaction = async (req, res) => {
  try {
    const {
      productId,
      type,
      quantity,
      note,
      unitPrice,
      customerName,
      paymentMethod,
    } = req.body;

    const numericQuantity = Number(quantity);

    if (!["IN", "OUT"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    if (!numericQuantity || numericQuantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      user: req.user._id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (type === "OUT" && product.quantity < numericQuantity) {
      return res.status(400).json({
        message: "Not enough stock available",
      });
    }

    if (type === "IN") {
      product.quantity += numericQuantity;
    } else {
      product.quantity -= numericQuantity;
    }

    await product.save();

    const finalUnitPrice =
      unitPrice === "" || unitPrice === undefined
        ? product.price
        : Number(unitPrice);

    const unitCost = product.costPrice || 0;

    const totalValue = type === "OUT" ? numericQuantity * finalUnitPrice : 0;
    const totalCost = type === "OUT" ? numericQuantity * unitCost : 0;
    const profit = type === "OUT" ? totalValue - totalCost : 0;

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      product: product._id,
      productName: product.name,
      sku: product.sku,
      quantity: numericQuantity,
      unitPrice: finalUnitPrice,
      unitCost,
      totalValue,
      totalCost,
      profit,
      customerName: type === "OUT" ? customerName || "" : "",
      paymentMethod: type === "OUT" ? paymentMethod || "" : "",
      note,
    });

    await Activity.create({
      user: req.user._id,
      action: "UPDATE",
      productName: product.name,
      sku: product.sku,
      change:
        type === "IN"
          ? `Stock increased by ${numericQuantity}`
          : `Sold ${numericQuantity} unit(s). Sales value: ₦${totalValue.toLocaleString()}. Profit: ₦${profit.toLocaleString()}`,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({
      message: "Transaction failed",
      error: error.message,
    });
  }
};

const quickSell = async (req, res) => {
  try {
    const { items, customerName, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No sale items provided.",
      });
    }

    const transactions = [];
    let totalSaleValue = 0;
    let totalProfit = 0;

    for (const item of items) {
      const numericQuantity = Number(item.quantity);

      if (!item.productId || !numericQuantity || numericQuantity <= 0) {
        return res.status(400).json({
          message: "Invalid sale item provided.",
        });
      }

      const product = await Product.findOne({
        _id: item.productId,
        user: req.user._id,
      });

      if (!product) {
        return res.status(404).json({
          message: `${item.name || "Product"} not found.`,
        });
      }

      if (product.quantity < numericQuantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}.`,
        });
      }

      const finalUnitPrice = product.price || 0;
      const unitCost = product.costPrice || 0;
      const totalValue = numericQuantity * finalUnitPrice;
      const totalCost = numericQuantity * unitCost;
      const profit = totalValue - totalCost;

      product.quantity -= numericQuantity;
      await product.save();

      const transaction = await Transaction.create({
        user: req.user._id,
        type: "OUT",
        product: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: numericQuantity,
        unitPrice: finalUnitPrice,
        unitCost,
        totalValue,
        totalCost,
        profit,
        customerName: customerName || "Quick Sale",
        paymentMethod: paymentMethod || "Cash",
        note: "Quick barcode sale",
      });

      await Activity.create({
        user: req.user._id,
        action: "UPDATE",
        productName: product.name,
        sku: product.sku,
        change: `Quick sold ${numericQuantity} unit(s). Sales value: ₦${totalValue.toLocaleString()}. Profit: ₦${profit.toLocaleString()}`,
      });

      totalSaleValue += totalValue;
      totalProfit += profit;
      transactions.push(transaction);
    }

    res.status(201).json({
      message: "Quick sale completed successfully.",
      totalSaleValue,
      totalProfit,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Quick sale failed.",
      error: error.message,
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  quickSell,
};
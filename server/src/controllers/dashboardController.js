const Product = require("../models/Product");
const Transaction = require("../models/Transaction");

const getDashboardSummary = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id });
    const transactions = await Transaction.find({ user: req.user._id });

    const totalProducts = products.length;

    const totalStockUnits = products.reduce(
      (sum, product) => sum + (product.quantity || 0),
      0
    );

    const lowStockItems = products.filter(
      (product) => product.status === "Low Stock"
    ).length;

    const outOfStockItems = products.filter(
      (product) => product.status === "Out of Stock"
    ).length;

    const saleTransactions = transactions.filter(
      (transaction) => transaction.type === "OUT"
    );

    const stockInTransactions = transactions.filter(
      (transaction) => transaction.type === "IN"
    );

    const totalRevenue = saleTransactions.reduce(
      (sum, transaction) => sum + (transaction.totalValue || 0),
      0
    );

    const totalProfit = saleTransactions.reduce(
      (sum, transaction) => sum + (transaction.profit || 0),
      0
    );

    const totalStockInUnits = stockInTransactions.reduce(
      (sum, transaction) => sum + (transaction.quantity || 0),
      0
    );

    const totalStockOutUnits = saleTransactions.reduce(
      (sum, transaction) => sum + (transaction.quantity || 0),
      0
    );

    res.status(200).json({
      totalProducts,
      totalStockUnits,
      lowStockItems,
      outOfStockItems,
      totalRevenue,
      totalProfit,
      totalStockInUnits,
      totalStockOutUnits,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load dashboard summary",
      error: error.message,
    });
  }
};

module.exports = { getDashboardSummary };
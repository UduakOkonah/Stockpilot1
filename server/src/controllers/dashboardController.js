const Product = require("../models/Product");
const Transaction = require("../models/Transaction");

const getDashboardSummary = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id });

    const transactions = await Transaction.find({
      user: req.user._id,
    });

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

    // =========================
    // DATE ANALYTICS
    // =========================

    const now = new Date();

    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setMonth(now.getMonth() - 1);

    const yearAgo = new Date();
    yearAgo.setFullYear(now.getFullYear() - 1);

    const weeklySales = saleTransactions.filter(
      (transaction) => new Date(transaction.createdAt) >= weekAgo
    );

    const monthlySales = saleTransactions.filter(
      (transaction) => new Date(transaction.createdAt) >= monthAgo
    );

    const yearlySales = saleTransactions.filter(
      (transaction) => new Date(transaction.createdAt) >= yearAgo
    );

    const weeklyRevenue = weeklySales.reduce(
      (sum, transaction) => sum + (transaction.totalValue || 0),
      0
    );

    const monthlyRevenue = monthlySales.reduce(
      (sum, transaction) => sum + (transaction.totalValue || 0),
      0
    );

    const yearlyRevenue = yearlySales.reduce(
      (sum, transaction) => sum + (transaction.totalValue || 0),
      0
    );

    const weeklyProfit = weeklySales.reduce(
      (sum, transaction) => sum + (transaction.profit || 0),
      0
    );

    const monthlyProfit = monthlySales.reduce(
      (sum, transaction) => sum + (transaction.profit || 0),
      0
    );

    const yearlyProfit = yearlySales.reduce(
      (sum, transaction) => sum + (transaction.profit || 0),
      0
    );

    // =========================
    // BEST SELLING PRODUCTS
    // =========================

    const bestSellingMap = {};

    saleTransactions.forEach((transaction) => {
      if (!bestSellingMap[transaction.productName]) {
        bestSellingMap[transaction.productName] = {
          name: transaction.productName,
          quantity: 0,
        };
      }

      bestSellingMap[transaction.productName].quantity +=
        transaction.quantity || 0;
    });

    const bestSellingProducts = Object.values(bestSellingMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // =========================
    // MOST PROFITABLE PRODUCTS
    // =========================

    const profitMap = {};

    saleTransactions.forEach((transaction) => {
      if (!profitMap[transaction.productName]) {
        profitMap[transaction.productName] = {
          name: transaction.productName,
          profit: 0,
        };
      }

      profitMap[transaction.productName].profit +=
        transaction.profit || 0;
    });

    const mostProfitableProducts = Object.values(profitMap)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    res.status(200).json({
      totalProducts,
      totalStockUnits,
      lowStockItems,
      outOfStockItems,
      totalRevenue,
      totalProfit,
      totalStockInUnits,
      totalStockOutUnits,

      weeklyRevenue,
      monthlyRevenue,
      yearlyRevenue,

      weeklyProfit,
      monthlyProfit,
      yearlyProfit,

      bestSellingProducts,
      mostProfitableProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load dashboard summary",
      error: error.message,
    });
  }
};

module.exports = { getDashboardSummary };
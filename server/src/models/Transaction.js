const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: String,
    sku: String,
    quantity: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: Number,
      default: 0,
    },
    unitCost: {
    type: Number,
    default: 0,
    },
    totalCost: {
    type: Number,
    default: 0,
    },
    profit: {
    type: Number,
    default: 0,
    },
    totalValue: {
      type: Number,
      default: 0,
    },
    customerName: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Transfer", "POS", "Other", ""],
      default: "",
    },
    note: String,
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
const mongoose = require("mongoose");

const businessProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    receiptPrefix: {
      type: String,
      default: "SP",
      trim: true,
    },
    showBusinessEmail: {
      type: Boolean,
      default: true,
    },
    showBusinessPhone: {
      type: Boolean,
      default: true,
    },
    showBusinessAddress: {
      type: Boolean,
      default: true,
    },
    showThankYouMessage: {
      type: Boolean,
      default: true,
    },
    lowStockAlertsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessProfile", businessProfileSchema);
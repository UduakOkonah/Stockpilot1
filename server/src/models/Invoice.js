const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      default: "",
    },

    customerPhone: {
      type: String,
      default: "",
    },

    customerAddress: {
      type: String,
      default: "",
    },

    items: {
      type: [invoiceItemSchema],
      required: true,
      validate: {
        validator(value) {
          return value.length > 0;
        },
        message: "Invoice must have at least one item",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },

    currency: {
      type: String,
      default: "NGN",
    },

    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

invoiceSchema.index({ user: 1, invoiceNumber: 1 }, { unique: true });

module.exports = mongoose.model("Invoice", invoiceSchema);
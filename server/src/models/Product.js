const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 5,
      min: 0,
    },
    supplier: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ user: 1, sku: 1 }, { unique: true });

productSchema.pre("save", function () {
  if (this.quantity === 0) {
    this.status = "Out of Stock";
  } else if (this.quantity <= this.reorderLevel) {
    this.status = "Low Stock";
  } else {
    this.status = "In Stock";
  }
});

module.exports = mongoose.model("Product", productSchema);
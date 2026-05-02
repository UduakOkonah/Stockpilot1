const Invoice = require("../models/Invoice");

const createInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      customerName,
      customerPhone,
      customerAddress,
      items,
      subtotal,
      currency,
      note,
    } = req.body;

    if (!invoiceNumber) {
      return res.status(400).json({
        message: "Invoice number is required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Invoice must have at least one item",
      });
    }

    const invoice = await Invoice.create({
      user: req.user._id,
      invoiceNumber,
      customerName: customerName?.trim() || "",
      customerPhone: customerPhone?.trim() || "",
      customerAddress: customerAddress?.trim() || "",
      items,
      subtotal: Number(subtotal) || 0,
      currency: currency || "NGN",
      note: note?.trim() || "",
    });

    res.status(201).json(invoice);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "This invoice number already exists.",
      });
    }

    res.status(500).json({
      message: "Failed to create invoice",
      error: error.message,
    });
  }
};

const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
};
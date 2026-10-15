const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Invoice = require("../models/Invoice");

function getOwnerId(req) {
  return req.user?._id || req.user?.id || null;
}

function requireOwner(req, res) {
  const ownerId = getOwnerId(req);

  if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
    res.status(401).json({
      success: false,
      message: "Please log in to access invoices.",
    });
    return null;
  }

  return ownerId;
}

function calculateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Add at least one product to the invoice.");
  }

  return items.map((item) => {
    const productId = item.product || item.productId;
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    if (!mongoose.isValidObjectId(productId)) {
      throw new Error("One of the invoice products has an invalid ID.");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Item quantities must be positive whole numbers.");
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error("Item prices must be valid non-negative numbers.");
    }

    const name = String(item.name || "").trim();

    if (!name) {
      throw new Error("Each invoice item must have a product name.");
    }

    return {
      product: productId,
      name,
      sku: String(item.sku || "").trim(),
      quantity,
      unitPrice,
      total: Number((quantity * unitPrice).toFixed(2)),
    };
  });
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.createInvoice = async (req, res) => {
  try {
    const ownerId = requireOwner(req, res);
    if (!ownerId) return;

    const {
      customerName,
      customerEmail = "",
      customerAddress = "",
      items: requestItems,
      currency = "NGN",
      note = "",
    } = req.body;

    if (typeof customerName !== "string" || !customerName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required.",
      });
    }

    if (
      customerEmail &&
      (typeof customerEmail !== "string" || !validEmail(customerEmail.trim()))
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid customer email.",
      });
    }

    const items = calculateItems(requestItems);
    const subtotal = Number(
      items.reduce((sum, item) => sum + item.total, 0).toFixed(2)
    );

    const safeCurrency =
      typeof currency === "string" && /^[A-Z]{3}$/i.test(currency.trim())
        ? currency.trim().toUpperCase()
        : "NGN";

    const invoice = await Invoice.create({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerAddress:
        typeof customerAddress === "string" ? customerAddress.trim() : "",
      items,
      subtotal,
      total: subtotal,
      currency: safeCurrency,
      note: typeof note === "string" ? note.trim() : "",
      createdBy: ownerId,
    });

    return res.status(201).json({
      success: true,
      message: "Invoice saved successfully.",
      data: invoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error);

    return res.status(error.message?.startsWith("Add at least") ||
      error.message?.startsWith("One of") ||
      error.message?.startsWith("Item ") ||
      error.message?.startsWith("Each invoice")
      ? 400
      : 500).json({
        success: false,
        message:
          error.name === "ValidationError"
            ? error.message
            : error.message || "Failed to save invoice.",
      });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const ownerId = requireOwner(req, res);
    if (!ownerId) return;

    const invoices = await Invoice.find({ createdBy: ownerId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    console.error("Get invoices error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve invoices.",
    });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const ownerId = requireOwner(req, res);
    if (!ownerId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID.",
      });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: ownerId,
    }).lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Get invoice error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve invoice.",
    });
  }
};

exports.sendInvoiceEmail = async (req, res) => {
  try {
    const ownerId = requireOwner(req, res);
    if (!ownerId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID.",
      });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: ownerId,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    if (!invoice.customerEmail || !validEmail(invoice.customerEmail)) {
      return res.status(400).json({
        success: false,
        message: "Add a valid customer email before sending this invoice.",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(503).json({
        success: false,
        message: "Invoice email is not configured on the server.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const itemLines = invoice.items.map(
      (item) =>
        `${item.name} x ${item.quantity} — ${invoice.currency} ${Number(
          item.total
        ).toFixed(2)}`
    );

    await transporter.sendMail({
      from: `"StockPilot" <${process.env.EMAIL_USER}>`,
      to: invoice.customerEmail,
      subject: `Invoice ${invoice.invoiceNumber} from StockPilot`,
      text: [
        `Hello ${invoice.customerName},`,
        "",
        "Here are your invoice details:",
        `Invoice number: ${invoice.invoiceNumber}`,
        "",
        ...itemLines,
        "",
        `Subtotal: ${invoice.currency} ${Number(invoice.subtotal).toFixed(2)}`,
        `Total: ${invoice.currency} ${Number(invoice.total).toFixed(2)}`,
        invoice.note ? `Note: ${invoice.note}` : "",
        "",
        "Thank you for your business.",
      ].filter(Boolean).join("\n"),
    });

    invoice.status = "sent";
    await invoice.save();

    return res.status(200).json({
      success: true,
      message: "Invoice email sent successfully.",
      data: invoice,
    });
  } catch (error) {
    console.error("Send invoice email error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send invoice email. Please try again later.",
    });
  }
};
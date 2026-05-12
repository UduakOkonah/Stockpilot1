const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const sendEmail = require("../utils/emailService");

const createInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      subtotal,
      currency,
      note,
    } = req.body;

    if (!invoiceNumber) {
      return res.status(400).json({ message: "Invoice number is required" });
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
      customerEmail: customerEmail?.trim() || "",
      customerPhone: customerPhone?.trim() || "",
      customerAddress: customerAddress?.trim() || "",
      items,
      subtotal: Number(subtotal) || 0,
      currency: currency || "NGN",
      note: note?.trim() || "",
    });

    return res.status(201).json(invoice);
  } catch (error) {
    console.log("CREATE INVOICE ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "This invoice number already exists.",
      });
    }

    return res.status(500).json({
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

    return res.status(200).json(invoices);
  } catch (error) {
    console.log("GET INVOICES ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};

const sendInvoiceEmail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid invoice ID",
      });
    }

    const invoice = await Invoice.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    if (!invoice.customerEmail || !invoice.customerEmail.trim()) {
      return res.status(400).json({
        message: "Customer email is missing",
      });
    }

    const itemsHtml = invoice.items
      .map((item) => {
        const name = item.name || "Unnamed item";
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unitPrice || 0);
        const total = Number(item.total || quantity * unitPrice || 0);

        return `
          <tr>
            <td style="padding:10px;border:1px solid #e5e7eb;">
              ${name}
            </td>
            <td style="padding:10px;border:1px solid #e5e7eb;text-align:center;">
              ${quantity}
            </td>
            <td style="padding:10px;border:1px solid #e5e7eb;text-align:right;">
              ${invoice.currency} ${unitPrice.toLocaleString()}
            </td>
            <td style="padding:10px;border:1px solid #e5e7eb;text-align:right;">
              ${invoice.currency} ${total.toLocaleString()}
            </td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
        <div style="max-width:680px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:#020617;color:#ffffff;padding:24px;">
            <h2 style="margin:0;">StockPilot Invoice</h2>
            <p style="margin:8px 0 0;color:#cbd5e1;">
              Invoice No: ${invoice.invoiceNumber}
            </p>
          </div>

          <div style="padding:24px;">
            <p>Hello ${invoice.customerName || "Customer"},</p>

            <p>
              Thank you for your purchase. Your invoice receipt is below.
            </p>

            <table style="width:100%;border-collapse:collapse;margin-top:20px;">
              <thead>
                <tr style="background:#f1f5f9;">
                  <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Product</th>
                  <th style="padding:10px;border:1px solid #e5e7eb;text-align:center;">Qty</th>
                  <th style="padding:10px;border:1px solid #e5e7eb;text-align:right;">Unit Price</th>
                  <th style="padding:10px;border:1px solid #e5e7eb;text-align:right;">Total</th>
                </tr>
              </thead>

              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <h3 style="text-align:right;margin-top:24px;">
              Total: ${invoice.currency} ${Number(invoice.subtotal || 0).toLocaleString()}
            </h3>

            ${
              invoice.note
                ? `<p style="margin-top:20px;"><strong>Note:</strong> ${invoice.note}</p>`
                : ""
            }

            <p style="margin-top:32px;color:#64748b;font-size:13px;">
              Generated by StockPilot Smart Inventory System.
            </p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: invoice.customerEmail.trim(),
      subject: `Invoice ${invoice.invoiceNumber}`,
      html,
    });

    return res.status(200).json({
      message: "Invoice email sent successfully",
    });
  } catch (error) {
    console.log("SEND EMAIL ERROR:", error);

    return res.status(500).json({
      message: "Failed to send invoice email",
      error: error.message,
    });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  sendInvoiceEmail,
};
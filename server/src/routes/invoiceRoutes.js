const express = require("express");
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  sendInvoiceEmail,
} = require("../controllers/invoiceController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getInvoices);
router.post("/", createInvoice);
router.get("/:id", getInvoiceById);
router.post("/:id/send", sendInvoiceEmail);

module.exports = router;
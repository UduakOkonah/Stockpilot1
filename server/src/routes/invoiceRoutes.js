const express = require("express");

const {
  createInvoice,
  getInvoices,
  sendInvoiceEmail,
} = require("../controllers/invoiceController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getInvoices);
router.post("/", createInvoice);
router.post("/:id/send-email", sendInvoiceEmail);

module.exports = router;
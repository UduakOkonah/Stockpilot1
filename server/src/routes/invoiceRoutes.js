const express = require("express");
const {
  createInvoice,
  getInvoices,
} = require("../controllers/invoiceController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getInvoices);
router.post("/", protect, createInvoice);

module.exports = router;
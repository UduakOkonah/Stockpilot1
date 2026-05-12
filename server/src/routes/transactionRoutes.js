const express = require("express");

const {
  createTransaction,
  getTransactions,
  quickSell,
} = require("../controllers/transactionController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getTransactions);
router.post("/", createTransaction);
router.post("/quick-sell", quickSell);

module.exports = router;
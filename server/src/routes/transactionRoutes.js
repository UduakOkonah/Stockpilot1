const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getTransactions,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", createTransaction);
router.get("/", getTransactions);

module.exports = router;
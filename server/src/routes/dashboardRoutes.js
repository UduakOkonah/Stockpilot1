const express = require("express");
const router = express.Router();
const { getDashboardSummary } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getDashboardSummary);

module.exports = router;
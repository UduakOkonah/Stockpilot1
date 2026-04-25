const express = require("express");
const router = express.Router();
const {
  getBusinessProfile,
  updateBusinessProfile,
} = require("../controllers/businessProfileController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getBusinessProfile);
router.put("/", updateBusinessProfile);

module.exports = router;
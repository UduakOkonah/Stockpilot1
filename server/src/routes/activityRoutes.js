const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(activities);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch activities",
      error: error.message,
    });
  }
});

module.exports = router;
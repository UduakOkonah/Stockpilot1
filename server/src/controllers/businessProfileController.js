const BusinessProfile = require("../models/BusinessProfile");

const getBusinessProfile = async (req, res) => {
  try {
    let profile = await BusinessProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = await BusinessProfile.create({
        user: req.user._id,
        businessName: "",
        phone: "",
        email: req.user.email || "",
        address: "",
        currency: "NGN",
        receiptPrefix: "SP",
        showBusinessEmail: true,
        showBusinessPhone: true,
        showBusinessAddress: true,
        showThankYouMessage: true,
        lowStockAlertsEnabled: true,
      });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch business profile",
      error: error.message,
    });
  }
};

const updateBusinessProfile = async (req, res) => {
  try {
    const {
      businessName,
      phone,
      email,
      address,
      currency,
      receiptPrefix,
      showBusinessEmail,
      showBusinessPhone,
      showBusinessAddress,
      showThankYouMessage,
      lowStockAlertsEnabled,
    } = req.body;

    const profile = await BusinessProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        businessName,
        phone,
        email,
        address,
        currency,
        receiptPrefix,
        showBusinessEmail,
        showBusinessPhone,
        showBusinessAddress,
        showThankYouMessage,
        lowStockAlertsEnabled,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update business profile",
      error: error.message,
    });
  }
};

module.exports = {
  getBusinessProfile,
  updateBusinessProfile,
};
const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema(
  {
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    features: [{ type: String, required: true }],
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pricing", pricingSchema);

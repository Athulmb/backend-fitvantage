const Pricing = require("../models/pricing.model");

// ------------------ PUBLIC ------------------ //
const getPricings = async (req, res) => {
  try {
    const pricings = await Pricing.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, pricings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPricing = async (req, res) => {
  try {
    const pricing = await Pricing.findById(req.params.id);
    if (!pricing)
      return res.status(404).json({ success: false, message: "Pricing not found" });

    res.status(200).json({ success: true, pricing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ ADMIN ------------------ //
const createPricing = async (req, res) => {
    try {
      if (!req.user || req.user.role !== "Admin")
        return res.status(403).json({ success: false, message: "Not authorized" });
  
      const { duration, price, features, isPopular } = req.body;
  
      const pricing = new Pricing({
        duration,
        price,
        features, // ✅ no JSON.parse
        isPopular: isPopular || false,
      });
  
      await pricing.save();
      res.status(201).json({ success: true, pricing });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  const updatePricing = async (req, res) => {
    try {
      if (!req.user || req.user.role !== "Admin")
        return res.status(403).json({ success: false, message: "Not authorized" });
  
      const { duration, price, features, isPopular } = req.body;
  
      const data = {
        duration,
        price,
        features, // ✅ directly use it
        isPopular,
      };
  
      const pricing = await Pricing.findByIdAndUpdate(req.params.id, data, { new: true });
      if (!pricing)
        return res.status(404).json({ success: false, message: "Pricing not found" });
  
      res.status(200).json({ success: true, pricing });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
  

const deletePricing = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const pricing = await Pricing.findByIdAndDelete(req.params.id);
    if (!pricing)
      return res.status(404).json({ success: false, message: "Pricing not found" });

    res.status(200).json({ success: true, message: "Pricing deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPricings, getPricing, createPricing, updatePricing, deletePricing };

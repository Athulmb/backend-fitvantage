const Center = require("../models/center.model");
const fs = require("fs");
const path = require("path");

// ------------------ PUBLIC ------------------ //
const getCenters = async (req, res) => {
  try {
    const centers = await Center.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, centers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCenter = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);
    if (!center)
      return res.status(404).json({ success: false, message: "Center not found" });

    res.status(200).json({ success: true, center });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ ADMIN ------------------ //
const createCenter = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const { title, location } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const center = new Center({ title, location, image });
    await center.save();

    res.status(201).json({ success: true, center });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateCenter = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const { title, location } = req.body;
    const data = { title, location };

    if (req.file) data.image = `/uploads/${req.file.filename}`;

    const center = await Center.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!center)
      return res.status(404).json({ success: false, message: "Center not found" });

    res.status(200).json({ success: true, center });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCenter = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const center = await Center.findByIdAndDelete(req.params.id);
    if (!center)
      return res.status(404).json({ success: false, message: "Center not found" });

    if (center.image) {
      const filePath = path.join(__dirname, "..", center.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(200).json({ success: true, message: "Center deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCenters, getCenter, createCenter, updateCenter, deleteCenter };

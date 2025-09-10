const Sport = require("../models/sport.model");
const fs = require("fs");
const path = require("path");

// ------------------ PUBLIC ------------------ //
const getSports = async (req, res) => {
  try {
    const sports = await Sport.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, sports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSport = async (req, res) => {
  try {
    const sport = await Sport.findById(req.params.id);
    if (!sport)
      return res.status(404).json({ success: false, message: "Sport not found" });

    res.status(200).json({ success: true, sport });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ ADMIN ------------------ //
const createSport = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const { title } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const sport = new Sport({ title, image });
    await sport.save();

    res.status(201).json({ success: true, sport });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateSport = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const { title } = req.body;
    const data = { title };

    if (req.file) data.image = `/uploads/${req.file.filename}`;

    const sport = await Sport.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!sport)
      return res.status(404).json({ success: false, message: "Sport not found" });

    res.status(200).json({ success: true, sport });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteSport = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const sport = await Sport.findByIdAndDelete(req.params.id);
    if (!sport)
      return res.status(404).json({ success: false, message: "Sport not found" });

    if (sport.image) {
      const filePath = path.join(__dirname, "..", sport.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(200).json({ success: true, message: "Sport deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSports, getSport, createSport, updateSport, deleteSport };

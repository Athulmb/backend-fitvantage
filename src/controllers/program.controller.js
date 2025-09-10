const Program = require("../models/program.model");
const fs = require("fs");
const path = require("path");

// ------------------ PUBLIC ------------------ //
const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, programs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: "Program not found" });
    res.status(200).json({ success: true, program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ ADMIN ------------------ //
const createProgram = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const { title, subtitle } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const program = new Program({ title, subtitle, image });
    await program.save();
    res.status(201).json({ success: true, program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProgram = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const { title, subtitle } = req.body;
    const data = { title, subtitle };

    if (req.file) data.image = `/uploads/${req.file.filename}`;

    const program = await Program.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!program) return res.status(404).json({ success: false, message: "Program not found" });

    res.status(200).json({ success: true, program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProgram = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: "Program not found" });

    if (program.image) {
      const filePath = path.join(__dirname, "..", program.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(200).json({ success: true, message: "Program deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPrograms, getProgram, createProgram, updateProgram, deleteProgram };

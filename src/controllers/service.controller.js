const Service = require("../models/service.model");
const fs = require("fs");
const path = require("path");

// Create Service (Admin only)
const createService = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const service = new Service({
      title: req.body.title,
      imagePath: req.file ? `/uploads/${req.file.filename}` : "",
      imageName: req.file ? req.file.filename : ""
    });

    await service.save();

    res.status(201).json({ success: true, data: service, message: "Service created" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all services (public)
const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single service by ID (public)
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    res.json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update Service (Admin only)
const updateService = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    // Delete old image if new uploaded
    if (req.file && service.imageName) {
      const oldPath = path.join(__dirname, "..", "uploads", service.imageName);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    service.title = req.body.title || service.title;
    if (req.file) {
      service.imagePath = `/uploads/${req.file.filename}`;
      service.imageName = req.file.filename;
    }

    await service.save();

    res.json({ success: true, data: service, message: "Service updated" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete Service (Admin only)
const deleteService = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    if (service.imageName) {
      const filePath = path.join(__dirname, "..", "uploads", service.imageName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
};

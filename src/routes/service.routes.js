const express = require('express');
const router = express.Router();
const Service = require('../models/service.model'); // Correct
const upload = require('../utils/fileUpload'); // <- your existing Multer config
const auth = require('../middlewares/authMiddleware');

// GET all services (public)
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
});

// GET single service
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(200).json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch service' });
  }
});

// POST create service (Admin only)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'Admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const service = new Service({
      title: req.body.title,
      imagePath: req.file ? `/uploads/${req.file.filename}` : '',
      imageName: req.file ? req.file.filename : ''
    });

    await service.save();
    res.status(201).json({ success: true, message: 'Service created', data: service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create service: ' + err.message });
  }
});

// PUT update service (Admin only)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'Admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const data = { title: req.body.title };

    if (req.file) {
      data.imagePath = `/uploads/${req.file.filename}`;
      data.imageName = req.file.filename;
    }

    const service = await Service.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    res.status(200).json({ success: true, message: 'Service updated', data: service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update service: ' + err.message });
  }
});

// DELETE service (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'Admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    // Delete image safely
    if (service.imageName) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '..', 'uploads', service.imageName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(200).json({ success: true, message: 'Service deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete service: ' + err.message });
  }
});

module.exports = router;

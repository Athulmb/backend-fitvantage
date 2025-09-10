// src/models/service.model.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imagePath: { type: String },
  imageName: { type: String }
}, { timestamps: true });

// This is the correct export
module.exports = mongoose.model('Service', serviceSchema);

const About = require("../models/about.model");
const fs = require("fs");
const path = require("path");

// ------------------ PUBLIC ------------------ //
const getAbout = async (req, res) => {
  try {
    const about = await About.findOne(); // only one AboutPage
    res.status(200).json({ success: true, about });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAboutById = async (req, res) => {
  try {
    const about = await About.findById(req.params.id);
    if (!about) return res.status(404).json({ success: false, message: "About not found" });
    res.status(200).json({ success: true, about });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ ADMIN ------------------ //
const createAbout = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const aboutData = req.body;

    // handle image uploads if provided
    if (req.files) {
      if (req.files.heroBgImage) {
        aboutData.hero = aboutData.hero || {};
        aboutData.hero.bgImage = `/uploads/${req.files.heroBgImage[0].filename}`;
      }
      if (req.files.qrImg) {
        aboutData.hero = aboutData.hero || {};
        aboutData.hero.qrImg = `/uploads/${req.files.qrImg[0].filename}`;
      }
      if (req.files.descriptionImages) {
        aboutData.description = aboutData.description || {};
        aboutData.description.images = req.files.descriptionImages.map(
          (f) => `/uploads/${f.filename}`
        );
      }
      if (req.files.trainerImage) {
        aboutData.trainer = aboutData.trainer || {};
        aboutData.trainer.image = `/uploads/${req.files.trainerImage[0].filename}`;
      }
    }

    const about = new About(aboutData);
    await about.save();
    res.status(201).json({ success: true, about });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateAbout = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    let about = await About.findById(req.params.id);
    if (!about) return res.status(404).json({ success: false, message: "About not found" });

    const updateData = req.body;

    // handle new uploads
    if (req.files) {
      if (req.files.heroBgImage) {
        updateData.hero = updateData.hero || {};
        updateData.hero.bgImage = `/uploads/${req.files.heroBgImage[0].filename}`;
      }
      if (req.files.qrImg) {
        updateData.hero = updateData.hero || {};
        updateData.hero.qrImg = `/uploads/${req.files.qrImg[0].filename}`;
      }
      if (req.files.descriptionImages) {
        updateData.description = updateData.description || {};
        updateData.description.images = req.files.descriptionImages.map(
          (f) => `/uploads/${f.filename}`
        );
      }
      if (req.files.trainerImage) {
        updateData.trainer = updateData.trainer || {};
        updateData.trainer.image = `/uploads/${req.files.trainerImage[0].filename}`;
      }
    }

    about = await About.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json({ success: true, about });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAbout = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const about = await About.findByIdAndDelete(req.params.id);
    if (!about) return res.status(404).json({ success: false, message: "About not found" });

    // cleanup images
    const allImages = [
      about.hero?.bgImage,
      about.hero?.qrImg,
      ...(about.description?.images || []),
      about.trainer?.image,
    ];
    allImages.forEach((imgPath) => {
      if (imgPath) {
        const filePath = path.join(__dirname, "..", imgPath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    });

    res.status(200).json({ success: true, message: "About deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAbout, getAboutById, createAbout, updateAbout, deleteAbout };

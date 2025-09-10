const UserStory = require("../models/userStory.model");
const fs = require("fs");
const path = require("path");

// ------------------ PUBLIC ------------------ //
const getUserStories = async (req, res) => {
  try {
    const stories = await UserStory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, stories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserStory = async (req, res) => {
  try {
    const story = await UserStory.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });
    res.status(200).json({ success: true, story });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ ADMIN ------------------ //
const createUserStory = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const { name, title } = req.body;
    const image = req.files?.image ? `/uploads/${req.files.image[0].filename}` : "";
    const bg = req.files?.bg ? `/uploads/${req.files.bg[0].filename}` : "";
    const videoUrl = req.files?.video ? `/uploads/${req.files.video[0].filename}` : "";

    const story = new UserStory({ name, title, image, bg, videoUrl });
    await story.save();

    res.status(201).json({ success: true, story });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateUserStory = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const { name, title } = req.body;
    const data = { name, title };

    if (req.files?.image) data.image = `/uploads/${req.files.image[0].filename}`;
    if (req.files?.bg) data.bg = `/uploads/${req.files.bg[0].filename}`;
    if (req.files?.video) data.videoUrl = `/uploads/${req.files.video[0].filename}`;

    const story = await UserStory.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });

    res.status(200).json({ success: true, story });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUserStory = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const story = await UserStory.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });

    // Delete uploaded files
    ["image", "bg", "videoUrl"].forEach((fileField) => {
      if (story[fileField]) {
        const filePath = path.join(__dirname, "..", story[fileField]);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    });

    res.status(200).json({ success: true, message: "Story deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getUserStories, getUserStory, createUserStory, updateUserStory, deleteUserStory };

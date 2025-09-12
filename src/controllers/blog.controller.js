const Blog = require("../models/blog.model");
const fs = require("fs");
const path = require("path");

// ------------------ PUBLIC ------------------ //
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.status(200).json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ ADMIN ------------------ //
const createBlog = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const blogData = {
      title: req.body.title,
      tag: req.body.tag,
      date: req.body.date,
      time: req.body.time,
      videoUrl: req.body.videoUrl || "",
      isTrending: req.body.isTrending === "true" || req.body.isTrending === true, // handle boolean
    };

    // handle image upload
    if (req.file) {
      blogData.image = `/uploads/${req.file.filename}`;
    }

    const blog = new Blog(blogData);
    await blog.save();
    res.status(201).json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    let blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const updateData = {
      title: req.body.title,
      tag: req.body.tag,
      date: req.body.date,
      time: req.body.time,
      videoUrl: req.body.videoUrl || "",
      isTrending: req.body.isTrending === "true" || req.body.isTrending === true,
    };

    // handle new image upload
    if (req.file) {
      if (blog.image) {
        const filePath = path.join(__dirname, "..", blog.image);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      updateData.image = `/uploads/${req.file.filename}`;
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    // remove uploaded image
    if (blog.image) {
      const filePath = path.join(__dirname, "..", blog.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog };

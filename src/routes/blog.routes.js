const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const upload = require("../utils/fileUpload"); // single file upload

const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blog.controller");

// PUBLIC
router.get("/", getBlogs);
router.get("/:id", getBlogById);

// ADMIN
router.post("/", auth, upload.single("image"), createBlog);
router.put("/:id", auth, upload.single("image"), updateBlog);
router.delete("/:id", auth, deleteBlog);

module.exports = router;

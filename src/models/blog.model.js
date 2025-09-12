const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tag: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    image: { type: String },        // thumbnail image
    videoUrl: { type: String },     // optional video URL
    isTrending: { type: Boolean, default: false }, // new boolean field for trending
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);

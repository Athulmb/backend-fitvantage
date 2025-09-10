const mongoose = require("mongoose");

const UserStorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },   // thumbnail
    bg: { type: String, required: true },      // background
    videoUrl: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserStory", UserStorySchema);

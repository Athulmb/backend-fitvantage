const mongoose = require("mongoose");

const AboutSchema = new mongoose.Schema(
  {
    // ✅ Hero Section
    hero: {
      bgImage: { type: String }, // uploaded image
      qrImg: { type: String },   // uploaded image
      description: { type: String },
    },

    // ✅ Description Section
    description: {
      texts: [{ type: String }], // multiple paragraphs
      images: [{ type: String }], // uploaded images
    },

    // ✅ Trainer Section
    trainer: {
      image: { type: String }, // uploaded image
      texts: [{ type: String }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("About", AboutSchema);

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    sku: { type: String },
    dateAdded: { type: Date, default: Date.now },
    brand: { type: String },
    weight: { type: String },
    productName: { type: String, required: true },
    category: { type: String },
    deliveryTime: { type: String },
    shortDescription: { type: String },
    images: { type: [String], default: [] },
    sizeVariants: {
        indian: { type: [String], default: [] },
        pakistan: { type: [String], default: [] },
    },
    colorVariants: { type: [String], default: [] },
    material: { type: [String], default: [] },
    stockQuantity: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    productDescription: { type: String },
    careInstructions: { type: String },
    neck: { type: String },
    topDesignStyling: { type: String },
    topFabric: { type: String },
    bottomFabric: { type: String },
    dupattaFabric: { type: String },
    weavePattern: { type: String },
    stitch: { type: String },
    printOrPattern: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

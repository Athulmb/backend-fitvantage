const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware"); // same auth you already have
const {
  getPricings,
  getPricing,
  createPricing,
  updatePricing,
  deletePricing,
} = require("../controllers/pricing.controller");

// PUBLIC
router.get("/", getPricings);
router.get("/:id", getPricing);

// ADMIN
router.post("/", auth, createPricing);
router.put("/:id", auth, updatePricing);
router.delete("/:id", auth, deletePricing);

module.exports = router;

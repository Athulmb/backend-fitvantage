const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const upload = require("../utils/fileUpload");
const {
  getSports,
  getSport,
  createSport,
  updateSport,
  deleteSport,
} = require("../controllers/sport.controller");

// PUBLIC
router.get("/", getSports);
router.get("/:id", getSport);

// ADMIN
router.post("/", auth, upload.single("image"), createSport);
router.put("/:id", auth, upload.single("image"), updateSport);
router.delete("/:id", auth, deleteSport);

module.exports = router;

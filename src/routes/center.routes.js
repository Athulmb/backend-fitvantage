const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const upload = require("../utils/fileUpload");
const {
  getCenters,
  getCenter,
  createCenter,
  updateCenter,
  deleteCenter,
} = require("../controllers/center.controller");

// PUBLIC
router.get("/", getCenters);
router.get("/:id", getCenter);

// ADMIN
router.post("/", auth, upload.single("image"), createCenter);
router.put("/:id", auth, upload.single("image"), updateCenter);
router.delete("/:id", auth, deleteCenter);

module.exports = router;

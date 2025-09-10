const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware"); // verify JWT & role
const upload = require("../utils/fileUpload"); // your existing multer config
const {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
} = require("../controllers/program.controller");

// PUBLIC
router.get("/", getPrograms);
router.get("/:id", getProgram);

// ADMIN
router.post("/", auth, upload.single("image"), createProgram);
router.put("/:id", auth, upload.single("image"), updateProgram);
router.delete("/:id", auth, deleteProgram);

module.exports = router;

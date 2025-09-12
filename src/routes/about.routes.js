const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware"); 
const upload = require("../utils/fileUpload"); 
const {
  getAbout,
  getAboutById,
  createAbout,
  updateAbout,
  deleteAbout,
} = require("../controllers/about.controller");

// PUBLIC
router.get("/", getAbout);
router.get("/:id", getAboutById);

// ADMIN
router.post(
  "/",
  auth,
  upload.fields([
    { name: "heroBgImage", maxCount: 1 },
    { name: "qrImg", maxCount: 1 },
    { name: "descriptionImages", maxCount: 5 },
    { name: "trainerImage", maxCount: 1 },
  ]),
  createAbout
);

router.put(
  "/:id",
  auth,
  upload.fields([
    { name: "heroBgImage", maxCount: 1 },
    { name: "qrImg", maxCount: 1 },
    { name: "descriptionImages", maxCount: 5 },
    { name: "trainerImage", maxCount: 1 },
  ]),
  updateAbout
);

router.delete("/:id", auth, deleteAbout);

module.exports = router;

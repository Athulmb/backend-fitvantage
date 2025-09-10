const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const upload = require("../utils/multiFileUpload");
const {
  getUserStories,
  getUserStory,
  createUserStory,
  updateUserStory,
  deleteUserStory,
} = require("../controllers/userStory.controller");

// PUBLIC
router.get("/", getUserStories);
router.get("/:id", getUserStory);

// ADMIN
router.post("/", auth, upload.fields([
  { name: "image", maxCount: 1 },
  { name: "bg", maxCount: 1 },
  { name: "video", maxCount: 1 },
]), createUserStory);

router.put("/:id", auth, upload.fields([
  { name: "image", maxCount: 1 },
  { name: "bg", maxCount: 1 },
  { name: "video", maxCount: 1 },
]), updateUserStory);

router.delete("/:id", auth, deleteUserStory);

module.exports = router;

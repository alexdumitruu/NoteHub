const express = require("express");
const router = express.Router();
const externalController = require("../controllers/externalController");
const auth = require("../middleware/auth");

// YouTube metadata endpoint (requires auth)
router.post("/youtube", auth, externalController.fetchYouTubeMetadata);

module.exports = router;

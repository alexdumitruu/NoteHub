const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const auth = require("../middleware/auth");

router.get("/", auth, groupController.getUserGroups);
router.post("/", auth, groupController.createGroup);

module.exports = router;

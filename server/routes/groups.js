const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const auth = require("../middleware/auth");

// Group routes
router.get("/", auth, groupController.getUserGroups);
router.post("/", auth, groupController.createGroup);
router.get("/:id", auth, groupController.getGroupDetails);
router.get("/:id/notes", auth, groupController.getGroupNotes);
router.post("/:id/invite", auth, groupController.inviteMember);
router.delete("/:id/members/:memberId", auth, groupController.removeMember);

module.exports = router;

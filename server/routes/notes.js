const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");
const auth = require("../middleware/auth");

router.get("/", auth, noteController.getUserNotes);
router.post("/", auth, noteController.createNote);
router.put("/:id", auth, noteController.updateNote);
router.delete("/:id", auth, noteController.deleteNote);

module.exports = router;

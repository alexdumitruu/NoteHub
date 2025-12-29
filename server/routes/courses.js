const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const auth = require("../middleware/auth");

router.get("/", auth, courseController.getAllCourses);
router.post("/", auth, courseController.createCourse); // Maybe admin only?

module.exports = router;

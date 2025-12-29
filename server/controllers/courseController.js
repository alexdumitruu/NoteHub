const Course = require("../models/Course");

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Create a new course
exports.createCourse = async (req, res) => {
    try {
        const { name, semester, teacher_name } = req.body;
        const newCourse = await Course.create({ name, semester, teacher_name });
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

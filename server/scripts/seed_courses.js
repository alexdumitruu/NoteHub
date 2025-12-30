require("dotenv").config();
const sequelize = require("../config/database");
const DB_Init = require("../config/dbInit");
const Course = require("../models/Course");

const courses = [
  "Android",
  "Web Technology",
  "Econometrics",
  "Java",
  "OOP",
  "Microeconomics",
  "Thesis",
];

async function seedCourses() {
  try {
    // Initialize DB and associations
    await DB_Init();
    await sequelize.authenticate();
    console.log("Database connected.");

    console.log("Seeding courses...");
    for (const name of courses) {
      await Course.findOrCreate({
        where: { name },
        defaults: { name },
      });
    }

    console.log("Courses seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding courses:", error);
    process.exit(1);
  }
}

seedCourses();

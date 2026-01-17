const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Course Model
 * Represents a university course that notes can be categorized under.
 * @typedef {Object} Course
 * @property {number} id - Primary key, auto-incremented unique identifier
 * @property {string} name - Course name (e.g., "Web Technologies", "Java Programming")
 * @property {number|null} semester - Semester number when the course is taught (optional)
 * @property {string|null} teacher_name - Name of the course instructor (optional)
 * @property {Date} createdAt - Timestamp when course was added (auto-generated)
 * @property {Date} updatedAt - Timestamp of last update (auto-generated)
 *
 * @description
 * Courses are used to organize and filter notes by subject.
 * Default courses are seeded via the `npm run db:seed` script.
 *
 * Relationships:
 * - Course hasMany Notes (1:N) - A course can have multiple notes associated with it
 */
const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  teacher_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Course;

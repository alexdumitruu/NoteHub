const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Note Model
 * @typedef {Object} Note
 * @property {number} id - Primary key
 * @property {string} title - Note title
 * @property {string} content - Note content (markdown)
 * @property {string[]} tags - Array of tags
 * @property {boolean} is_public - Whether the note is publicly visible
 * @property {number} user_id - Foreign key to User
 * @property {number} course_id - Foreign key to Course (optional)
 * @property {number} group_id - Foreign key to StudyGroup (optional)
 */
const Note = sequelize.define("Note", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tags: {
    type: DataTypes.STRING, // Storing as comma-separated string
    allowNull: true,
    get() {
      const rawValue = this.getDataValue("tags");
      return rawValue ? rawValue.split(",") : [];
    },
    set(val) {
      this.setDataValue("tags", Array.isArray(val) ? val.join(",") : val);
    },
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Note;

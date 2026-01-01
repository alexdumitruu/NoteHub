const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Attachment Model
 * @typedef {Object} Attachment
 * @property {number} id - Primary key
 * @property {number} note_id - Foreign key to Note
 * @property {string} file_url - Path to the uploaded file
 * @property {string} file_type - Type of file ('image', 'pdf')
 * @property {string} original_name - Original filename
 */
const Attachment = sequelize.define("Attachment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  note_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING, // 'image', 'pdf'
    allowNull: false,
  },
  original_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Attachment;

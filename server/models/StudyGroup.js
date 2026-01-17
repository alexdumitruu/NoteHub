const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * StudyGroup Model
 * Represents a collaborative study group where users can share notes privately.
 * @typedef {Object} StudyGroup
 * @property {number} id - Primary key, auto-incremented unique identifier
 * @property {string} name - Name of the study group (e.g., "Web Tech Study Buddies")
 * @property {string|null} description - Optional description of the group's purpose
 * @property {number} admin_user_id - Foreign key to User who created/administers the group
 * @property {Date} createdAt - Timestamp when group was created (auto-generated)
 * @property {Date} updatedAt - Timestamp of last update (auto-generated)
 *
 * @description
 * Study groups allow private note sharing among members.
 * Only the admin can invite new members or remove existing ones.
 * The creator is automatically added as both admin and member.
 *
 * Relationships:
 * - StudyGroup belongsTo User as Admin (N:1) - Each group has one admin
 * - StudyGroup belongsToMany Users via GroupMember (N:M) - Groups have multiple members
 * - StudyGroup hasMany Notes (1:N) - Notes can be shared with a group
 */
const StudyGroup = sequelize.define("StudyGroup", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = StudyGroup;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * GroupMember Model (Junction Table)
 * Represents the many-to-many relationship between Users and StudyGroups.
 * @typedef {Object} GroupMember
 * @property {number} group_id - Foreign key to StudyGroup (composite primary key)
 * @property {number} user_id - Foreign key to User (composite primary key)
 * @property {Date} joined_at - Timestamp when user joined the group (defaults to NOW)
 *
 * @description
 * This is a junction/pivot table that connects Users and StudyGroups.
 * It enables the many-to-many relationship where:
 * - A user can be a member of multiple study groups
 * - A study group can have multiple members
 *
 * Note: timestamps are disabled for this table as joined_at serves
 * as the only relevant timestamp.
 *
 * The group admin is also added as a member when the group is created.
 */
const GroupMember = sequelize.define(
  "GroupMember",
  {
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  },
);

module.exports = GroupMember;

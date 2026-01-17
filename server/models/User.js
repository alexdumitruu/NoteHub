const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");

/**
 * User Model
 * Represents a registered user in the NoteHub application.
 * @typedef {Object} User
 * @property {number} id - Primary key, auto-incremented unique identifier
 * @property {string} email - User's email address (unique, must be valid email format)
 * @property {string} password_hash - Bcrypt hashed password (auto-hashed via hooks)
 * @property {string} full_name - User's display name
 * @property {Date} createdAt - Timestamp when user registered (auto-generated)
 * @property {Date} updatedAt - Timestamp of last profile update (auto-generated)
 *
 * @description
 * The User model includes Sequelize hooks that automatically hash passwords:
 * - beforeCreate: Hashes password when a new user is created
 * - beforeUpdate: Re-hashes password if it was changed
 *
 * Relationships:
 * - User hasMany Notes (1:N) - A user can create multiple notes
 * - User hasMany StudyGroups as Admin (1:N) - A user can admin multiple groups
 * - User belongsToMany StudyGroups via GroupMember (N:M) - A user can be member of multiple groups
 */
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        // Custom validator for institutional email could go here
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password_hash")) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
    },
  },
);

module.exports = User;

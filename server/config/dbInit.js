const mysql = require("mysql2/promise");
require("dotenv").config();

// Import models (will be defined in Phase 2)
// const User = require('../models/User');
// const Course = require('../models/Course');
// const Note = require('../models/Note');
// const Attachment = require('../models/Attachment');
// const StudyGroup = require('../models/StudyGroup');
// const GroupMember = require('../models/GroupMember');

async function Create_DB() {
  let conn;

  try {
    conn = await mysql.createConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await conn.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database '${process.env.DB_NAME}' created successfully.`);
  } catch (err) {
    console.warn(err.stack);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

function FK_Config() {
  // =============================================
  // FOREIGN KEY RELATIONSHIPS
  // =============================================

  const User = require("../models/User");
  const Course = require("../models/Course");
  const Note = require("../models/Note");
  const Attachment = require("../models/Attachment");
  const StudyGroup = require("../models/StudyGroup");
  const GroupMember = require("../models/GroupMember");

  // -------------------------- User -> Notes (1-n) --------------------------
  User.hasMany(Note, { as: "Notes", foreignKey: "user_id" });
  Note.belongsTo(User, { foreignKey: "user_id" });

  // -------------------------- Course -> Notes (1-n) --------------------------
  Course.hasMany(Note, { as: "Notes", foreignKey: "course_id" });
  Note.belongsTo(Course, { foreignKey: "course_id" });

  // -------------------------- Note -> Attachments (1-n) --------------------------
  Note.hasMany(Attachment, { as: "Attachments", foreignKey: "note_id" });
  Attachment.belongsTo(Note, { foreignKey: "note_id" });

  // -------------------------- User -> StudyGroups (1-n as admin) --------------------------
  User.hasMany(StudyGroup, { as: "AdminGroups", foreignKey: "admin_user_id" });
  StudyGroup.belongsTo(User, { as: "Admin", foreignKey: "admin_user_id" });

  // -------------------------- StudyGroup <-> User (n-n via GroupMember) --------------------------
  StudyGroup.belongsToMany(User, {
    through: GroupMember,
    as: "Members",
    foreignKey: "group_id",
  });
  User.belongsToMany(StudyGroup, {
    through: GroupMember,
    as: "Groups",
    foreignKey: "user_id",
  });

  // -------------------------- Note -> StudyGroup (n-1 optional) --------------------------
  StudyGroup.hasMany(Note, { as: "Notes", foreignKey: "group_id" });
  Note.belongsTo(StudyGroup, { as: "Group", foreignKey: "group_id" });
}

async function DB_Init() {
  await Create_DB();
  FK_Config();
}

module.exports = DB_Init;

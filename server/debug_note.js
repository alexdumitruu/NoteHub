require("dotenv").config();
const sequelize = require("./config/database");
const Note = require("./models/Note");
const User = require("./models/User");

const DB_Init = require("./config/dbInit");

async function debugNote() {
  try {
    await DB_Init(); // Setup associations
    await sequelize.authenticate();
    console.log("Authenticated.");

    // 1. Get or Create a User
    let user = await User.findOne({ where: { email: "debug@test.com" } });
    if (!user) {
      user = await User.create({
        email: "debug@test.com",
        password_hash: "password",
        full_name: "Debug User",
      });
      console.log("Created debug user:", user.id);
    } else {
      console.log("Found debug user:", user.id);
    }

    // 2. Try to Create a Note
    console.log("Attempting to create note...");
    try {
      const note = await Note.create({
        title: "Test Note",
        content: "Content",
        user_id: user.id,
        // course_id: null, // Optional
        tags: ["debug", "test"],
        is_public: false,
      });
      console.log("Note created successfully:", note.id);
    } catch (e) {
      console.error("Note CREATION failed:", e.message);
      // console.error(e);
    }

    // 3. Try to Fetch Notes (replicating controller logic)
    console.log("Attempting to fetch notes...");
    try {
      const notes = await Note.findAll({
        where: { user_id: user.id },
        order: [["createdAt", "DESC"]],
      });
      console.log("Notes fetched successfully. Count:", notes.length);
    } catch (e) {
      console.error("Note FETCH failed:", e.message);
    }
  } catch (err) {
    console.error("Top level error:", err);
  } finally {
    await sequelize.close();
  }
}

debugNote();

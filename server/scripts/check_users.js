require("dotenv").config();
const sequelize = require("../config/database");
const User = require("../models/User");

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log("Connected.");

    const users = await User.findAll();
    console.log("Found", users.length, "users.");

    users.forEach((u) => {
      console.log(
        `User ID: ${u.id}, Email: ${u.email}, CreatedAt: ${
          u.createdAt
        }, created_at (raw): ${u.getDataValue("created_at")}`
      );
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sequelize.close();
  }
}

checkUsers();

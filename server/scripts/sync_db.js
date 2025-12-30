require("dotenv").config();
const sequelize = require("../config/database");
const DB_Init = require("../config/dbInit");

async function syncDatabase() {
  try {
    // Initialize database (create if not exists) and configure FK relations
    await DB_Init();

    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync models
    await sequelize.sync({ alter: true });
    console.log("Database models synchronized successfully.");

    process.exit(0);
  } catch (error) {
    console.error("Unable to sync database:", error);
    process.exit(1);
  }
}

syncDatabase();

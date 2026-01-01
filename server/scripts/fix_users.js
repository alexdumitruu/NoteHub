require("dotenv").config();
const sequelize = require("../config/database");
const User = require("../models/User");

async function fixUsers() {
  try {
    await sequelize.authenticate();
    console.log("Connected.");

    const users = await User.findAll();
    console.log("Found", users.length, "users.");

    const now = new Date();

    for (const u of users) {
      if (!u.createdAt || isNaN(new Date(u.createdAt))) {
        console.log(`Fixing user ${u.id}...`);
        u.setDataValue("created_at", now); // Force update raw field if needed
        u.changed("created_at", true);
        await u.save({ silent: true }); // silent prevents automatic update of updatedAt if we wanted

        // Alternative directly with SQL if model save doesn't behave as expected due to timestamps config
        // await sequelize.query(`UPDATE User SET created_at = NOW() WHERE id = ${u.id}`);
      }
    }

    // Using raw query to be absolutely sure
    await sequelize.query(
      "UPDATE User SET created_at = NOW() WHERE created_at IS NULL OR created_at = '0000-00-00 00:00:00'"
    );

    console.log("Users fixed.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sequelize.close();
  }
}

fixUsers();

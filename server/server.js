require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const DB_Init = require("./config/dbInit");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "NoteHub API is running",
    timestamp: new Date().toISOString(),
  });
});

// TODO: Import and use routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/notes', require('./routes/notes'));
// app.use('/api/courses', require('./routes/courses'));
// app.use('/api/groups', require('./routes/groups'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Database connection and server start
async function startServer() {
  try {
    // Initialize database (create if not exists) and configure FK relations
    await DB_Init();

    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync models (in development)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("Database models synchronized.");
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
}

startServer();

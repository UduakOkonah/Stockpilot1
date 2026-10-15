const dotenv = require("dotenv");
const path = require("path");
const express = require("express");

dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

console.log("MONGO URI exists:", Boolean(process.env.MONGO_URI));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
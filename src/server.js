require("dotenv").config();
const { default: mongoose } = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};
startServer();

const gracefulShutdown = async (signal, exitCode = 0) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  if (server) {
    server.close(async (err) => {
      if (err) console.error("Error closing server:", err);
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
      } catch (dbErr) {
        console.error("Error closing MongoDB:", dbErr);
      }
      process.exit(exitCode);
    });
  } else {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
    } catch (dbErr) {
      console.error("Error closing MongoDB:", dbErr);
    }
    process.exit(exitCode);
  }

  setTimeout(() => {
    console.error("Forced exit after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  gracefulShutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection", 1);
});

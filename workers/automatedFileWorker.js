// workers/automatedFileWorker.js
require("dotenv").config();

const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const {
  ensureDirectoriesExist,
  processSingleFile,
} = require("../services/automatedProcessingService");

const filePath = process.argv[2];

const run = async () => {
  if (!filePath) {
    console.error("[Worker] Missing file path argument.");
    process.exit(1);
  }

  try {
    await connectDB();
    await ensureDirectoriesExist();
    await processSingleFile(filePath, path.basename(filePath));
  } catch (error) {
    console.error(`[Worker] Fatal error processing ${filePath}:`, error);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.connection.close();
    } catch {}
  }
};

process.on("disconnect", () => {
  process.exit(1);
});

run().then(() => {
  if (!process.exitCode) {
    process.exit(0);
  }
});

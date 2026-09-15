import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./config/database";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Health check API
app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    application: "TravelWaste API",
    version: "1.0.0",
  });
});

// Health check database
app.get("/api/health/db", async (_req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      status: "OK",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      status: "ERROR",
      database: "disconnected",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`TravelWaste API running on port ${PORT}`);
});
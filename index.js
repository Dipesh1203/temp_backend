import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import serverless from "serverless-http";
import authRoutes from "./routes/auth.js";
import journalRoutes from "./routes/journal.js";
import analyticsRoutes from "./routes/analytics.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/analytics", analyticsRoutes);

// MongoDB Connection (only once)
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/journal_app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

export const handler = serverless(app);

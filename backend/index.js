// Packages
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

// Files
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import genreRoutes from "./routes/genreRoutes.js";
import moviesRoutes from "./routes/moviesRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

// Configuration
dotenv.config();
connectDB();

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/genre", genreRoutes);
app.use("/api/v1/movies", moviesRoutes);
app.use("/api/v1/upload", uploadRoutes);

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Movies backend is running",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

app.listen(PORT, "0.0.0.0", () => console.log(`Server is running on port ${PORT}`));

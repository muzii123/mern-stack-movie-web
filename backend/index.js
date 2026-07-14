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

// Metrics
import {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  activeConnections,
  deploymentsTotal,
  mongodbConnectionStatus,
  httpErrorsTotal,
} from "./metrics.js";

// Configuration
dotenv.config();
connectDB();

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

// ─── Metrics Middleware ───────────────────────────────────────────────────────
// Runs on every request to track duration, count, and active connections
app.use((req, res, next) => {
  // Skip tracking the /metrics endpoint itself
  if (req.path === "/metrics") return next();

  const start = Date.now();
  activeConnections.inc();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode,
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
    activeConnections.dec();

    // Track errors separately
    if (res.statusCode >= 400) {
      httpErrorsTotal.inc(labels);
    }
  });

  next();
});

// ─── Update MongoDB status metric every 10 seconds ───────────────────────────
setInterval(() => {
  const isConnected = mongoose.connection.readyState === 1 ? 1 : 0;
  mongodbConnectionStatus.set(isConnected);
}, 10000);

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/genre", genreRoutes);
app.use("/api/v1/movies", moviesRoutes);
app.use("/api/v1/upload", uploadRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Movies backend is running",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ─── Prometheus Metrics Endpoint ──────────────────────────────────────────────
// Prometheus scrapes this endpoint every 15 seconds
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// ─── Deployment Tracking Endpoint ─────────────────────────────────────────────
// Called from GitHub Actions CI/CD to track deployments
app.post("/metrics/deployment", (req, res) => {
  const { status = "success", environment = "dev" } = req.body;
  deploymentsTotal.inc({ status, environment });
  res.json({ recorded: true, status, environment });
});

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server is running on port ${PORT}`)
);

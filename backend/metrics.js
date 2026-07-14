import client from "prom-client";

// Create a registry to hold all metrics
const register = new client.Registry();

// Add default Node.js metrics (CPU, memory, heap, event loop, etc.)
client.collectDefaultMetrics({ register });

// ─── Custom Metric 1: Total HTTP Requests ────────────────────────────────────
// Counts every request by method, route, and status code
export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// ─── Custom Metric 2: HTTP Request Duration ──────────────────────────────────
// Measures how long each request takes (response time)
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// ─── Custom Metric 3: Active Connections ─────────────────────────────────────
// Tracks how many requests are currently being processed
export const activeConnections = new client.Gauge({
  name: "active_connections",
  help: "Number of active connections currently being handled",
  registers: [register],
});

// ─── Custom Metric 4: Deployments Total ──────────────────────────────────────
// Tracks deployment success/failure (incremented via /metrics/deployment endpoint)
export const deploymentsTotal = new client.Counter({
  name: "deployment_total",
  help: "Total number of deployments",
  labelNames: ["status", "environment"],
  registers: [register],
});

// ─── Custom Metric 5: MongoDB Connection Status ──────────────────────────────
// 1 = connected, 0 = disconnected
export const mongodbConnectionStatus = new client.Gauge({
  name: "mongodb_connection_status",
  help: "MongoDB connection status (1=connected, 0=disconnected)",
  registers: [register],
});

// ─── Custom Metric 6: HTTP Errors Total ──────────────────────────────────────
// Counts only error responses (4xx, 5xx)
export const httpErrorsTotal = new client.Counter({
  name: "http_errors_total",
  help: "Total number of HTTP error responses (4xx and 5xx)",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

export { register };

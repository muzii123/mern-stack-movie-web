import winston from "winston";
import LokiTransport from "winston-loki";

const LOKI_HOST = process.env.LOKI_HOST || "http://loki:3100";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: "movies-backend",
    environment: process.env.NODE_ENV || "development",
  },
  transports: [
    // Print logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // Send logs to Loki
    new LokiTransport({
      host: LOKI_HOST,
      labels: {
        app: "movies-backend",
        environment: process.env.NODE_ENV || "development",
      },
      json: true,
      format: winston.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) =>
        console.error("Loki connection error:", err.message),
    }),
  ],
});

export default logger;

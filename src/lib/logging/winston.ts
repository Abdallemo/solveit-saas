import winston from "winston";

const isProduction = process.env.NODE_ENV === "production";

const httpTransportHost = isProduction ? "127.0.0.1" : "localhost";
const httpTransportPort = isProduction ? 8080 : 3000;

const consoleFormat = winston.format.printf(({ level, message, timestamp }) => {
  const levelColor =
    {
      info: "\x1b[34m",
      warn: "\x1b[33m",
      error: "\x1b[31m",
      debug: "\x1b[35m",
    }[level] || "\x1b[37m";

  return `${levelColor}[${level.toUpperCase()}]\x1b[0m ${timestamp} ┃ ${message}`;
});

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        consoleFormat
      ),
    }),
    new winston.transports.Http({
      host: httpTransportHost,
      port: httpTransportPort,
      path: "/api/logs",
    }),
  ],
});

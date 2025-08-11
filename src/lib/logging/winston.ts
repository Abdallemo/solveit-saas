import { env } from "@/env/server";
import winston from "winston";
import url from "url";

const parsedUrl = url.parse(env.NEXTAUTH_URL || "http://localhost");


const host = parsedUrl.hostname || "localhost";
let port = parsedUrl.port ? Number(parsedUrl.port) : (parsedUrl.protocol === "https:" ? 8080 : 3000);
if (Number.isNaN(port)) port = 3000;

const consoleFormat = winston.format.printf(({ level, message, timestamp }) => {
  const levelColor = {
    info: "\x1b[34m",   
    warn: "\x1b[33m",    
    error: "\x1b[31m",   
    debug: "\x1b[35m"    
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
      )
    }),
    new winston.transports.Http({
      host,
      port,
      path: "/api/logs"
    })
  ]
});

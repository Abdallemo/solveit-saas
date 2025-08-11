async function clientLogger(level: "info" | "error" | "warn", message: string, errorObj?: any) {
  try {
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, message, error: errorObj, timestamp: new Date().toISOString() }),
    });
  } catch (err) {
    console.error("Failed to send client log:", err);
  }
}

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: string;
  stack?: string;
}

const REDACTED_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "api_key",
  "apikey",
  "key",
  "service_role",
]);

function sanitizeContext(obj: unknown, depth = 0): unknown {
  if (depth > 4 || obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeContext(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = sanitizeContext(value, depth + 1);
    }
  }
  return sanitized;
}

function outputLog(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  err?: unknown
) {
  const payload: LogPayload = {
    message,
    level,
    timestamp: new Date().toISOString(),
  };

  if (context) {
    payload.context = sanitizeContext(context) as Record<string, unknown>;
  }

  if (err instanceof Error) {
    payload.error = err.message;
    if (process.env.NODE_ENV !== "production") {
      payload.stack = err.stack;
    }
  } else if (err) {
    payload.error = String(err);
  }

  if (process.env.NODE_ENV === "development") {
    const time = payload.timestamp.split("T")[1].replace("Z", "");
    const prefix = `[${time}] [${level.toUpperCase()}]`;
    if (level === "error") {
      console.error(prefix, message, context ?? "", err ?? "");
    } else if (level === "warn") {
      console.warn(prefix, message, context ?? "");
    } else {
      console.log(prefix, message, context ?? "");
    }
    return;
  }

  const jsonString = JSON.stringify(payload);
  if (level === "error") {
    console.error(jsonString);
  } else if (level === "warn") {
    console.warn(jsonString);
  } else {
    console.log(jsonString);
  }
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    outputLog("info", message, context);
  },
  warn(message: string, context?: Record<string, unknown>, err?: unknown) {
    outputLog("warn", message, context, err);
  },
  error(message: string, err?: unknown, context?: Record<string, unknown>) {
    outputLog("error", message, context, err);
  },
  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      outputLog("debug", message, context);
    }
  },
};

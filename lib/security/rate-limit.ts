import { NextResponse } from "next/server";

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

// In-memory bucket store
const store = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 60 seconds
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60_000;

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of store.entries()) {
    if (record.resetAt <= now) {
      store.delete(key);
    }
  }

  // Safety valve: prevent unbounded map size under high cardinality attacks
  if (store.size > 10_000) {
    store.clear();
  }
}

/**
 * Checks and increments the rate limit counter for a given key.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  cleanupStaleEntries();

  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    store.set(key, newRecord);
    return {
      allowed: true,
      limit: options.limit,
      remaining: Math.max(0, options.limit - 1),
      resetMs: options.windowMs,
    };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      limit: options.limit,
      remaining: 0,
      resetMs: Math.max(0, existing.resetAt - now),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    limit: options.limit,
    remaining: Math.max(0, options.limit - existing.count),
    resetMs: Math.max(0, existing.resetAt - now),
  };
}

/**
 * Derives a client identifier for rate limiting from an authenticated user or request IP headers.
 */
export function getClientIdentifier(
  request: Request,
  userId?: string | null
): string {
  if (userId) return `user:${userId}`;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0]?.trim();
    if (ip) return `ip:${ip}`;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return `ip:${realIp.trim()}`;

  return "anonymous";
}

/**
 * Standard HTTP 429 Too Many Requests response with standard RateLimit headers.
 */
export function rateLimitResponse(
  resetMs: number,
  limit: number = 10,
  message: string = "Too many requests. Please slow down and try again shortly."
): NextResponse {
  const retryAfterSeconds = Math.max(1, Math.ceil(resetMs / 1000));
  const resetEpochSeconds = Math.ceil((Date.now() + resetMs) / 1000);

  return NextResponse.json(
    {
      error: message,
      code: "RATE_LIMITED",
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(resetEpochSeconds),
      },
    }
  );
}


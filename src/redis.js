import { Redis } from "@upstash/redis";

let redis = null;

/**
 * Get or create the Upstash Redis client singleton.
 * Uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars.
 */
export function getRedis() {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables. " +
          "Please set them in your Vercel project settings.",
      );
    }

    redis = new Redis({ url, token });
  }
  return redis;
}

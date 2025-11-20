import config from "@/lib/config";
import { Redis } from "@upstash/redis";

if (!config.env.upstash.redisUrl || !config.env.upstash.redisToken) {
  throw new Error("UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN environment variables must be set");
}

const redis = new Redis({
  url: config.env.upstash.redisUrl,
  token: config.env.upstash.redisToken,
});

export default redis;
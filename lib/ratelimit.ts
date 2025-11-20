import { Ratelimit } from "@upstash/ratelimit";
import redis from "@/database/redis";

// Create a new ratelimiter instance
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(5, "1m"), //fixed window, allowing 1 request per 1 minute
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export default ratelimit;

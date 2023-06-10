const Redis = require("koa-redis");

export const redisStore = Redis({ url: "redis-service:6379" });

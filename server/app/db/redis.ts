const Redis = require("koa-redis");

export const redisStore = Redis({ url: "redis:6379" });

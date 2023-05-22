const Redis = require("koa-redis");

export const redisStore = Redis({ url: "localhost:6379" });

const Redis = require("koa-redis");

export const redisStore = Redis({ url: "127.0.0.1:6379" });

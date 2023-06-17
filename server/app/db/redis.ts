import config from "../config";

const Redis = require("koa-redis");

export const redisStore = Redis({ url: `${config.redis_url}:${config.redis_port}` });

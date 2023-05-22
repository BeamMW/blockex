// https://github.com/zadzbw/koa2-cors

export default {
  origin: "*",
  allowMethods: ["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders: ["Content-type", "Accept", "X-Access-Token", "X-Key", "Authorization"],
};

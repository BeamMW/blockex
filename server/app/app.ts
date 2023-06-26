import * as http from "http";

import * as Koa from "koa";
import { koaSwagger } from "koa2-swagger-ui";
import Mongoose from "mongoose";
// import * as Sentry from "@sentry/node";

import config from "./config";
import middlewares from "./middlewares";
import router from "./routes";
import { ENVIRONMENT } from "./shared/constants";
import { BeamController } from "./controllers/beam.controller";

const websocket = require("koa-easy-ws");

const { host, port, server_url, env, db_host, db_name } = config;

Mongoose.connect(`mongodb://${db_host}:27017/${db_name}`);

const app: Koa = new Koa();

const websocketMiddleware = websocket();
const websocketServer = websocketMiddleware.server;

app.use(websocketMiddleware);

app.use(middlewares());

app.use(router.routes());

app.use(
  koaSwagger({
    routePrefix: "/swagger", // host at /swagger instead of default /docs
    swaggerOptions: {
      url:
        env === ENVIRONMENT.development
          ? `http://${host}:${port}/api/v1/swagger.json`
          : `${server_url}/api/v1/swagger.json`,
    },
  }),
);

// Application error logging.
app.on("error", (err: any, ctx: any) => {
  console.error(err);
});

const server = http.createServer(app.callback());

server.listen(port, host, () => {
  console.log(`listening on http://${host}:${port}`);
});

BeamController(websocketServer);

export default {
  app,
};

export { app };

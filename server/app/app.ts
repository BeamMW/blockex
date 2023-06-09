import * as http from "http";

import * as Koa from "koa";
import { koaSwagger } from "koa2-swagger-ui";
import Mongoose from "mongoose";
// import * as Sentry from "@sentry/node";
// import * as Router from "koa-router";

import config from "./config";
import middlewares from "./middlewares";
import router from "./routes";
import { ENVIRONMENT } from "./shared/constants";
import { BeamController } from "./controllers/beam.controller";

const mongooseOptions = {
  // useCreateIndex: true,
  // useNewUrlParser: true,
};
// Connect to the MongoDB database
// const connect = async () => {
//   try {
//     await Mongoose.connect("mongodb://beam-explorer-mongo:27017/explorer", mongooseOptions);
//     console.log("Connected to MongoDB");
//   } catch (error) {
//     console.log("Could not connect to MongoDB");
//     throw error;
//   }
// };

Mongoose.connect("mongodb://127.0.0.1:27017/explorer", mongooseOptions);

const { host, port, server_url, env } = config;

const app: Koa = new Koa();

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
app.on("error", (err, ctx) => {
  console.error(err);
});

const server = http.createServer(app.callback());

server.listen(port, host, () => {
  console.log(`listening on http://${host}:${port}`);
});

BeamController();

export default {
  app,
};

export { app };

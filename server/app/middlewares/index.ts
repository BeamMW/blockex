import * as cors from "koa2-cors";
import * as bodyParser from "koa-bodyparser";
import * as helmet from "koa-helmet";
import * as logger from "koa-logger";
// @ts-ignore
import * as respond from "koa-respond";
// @ts-ignore
import * as responseTime from "koa-response-time";
import { compose } from "koa-convert";

import { bodyParserOptions, corsOptions, helmetOptions, respondOptions } from "./options";
import errorHandler from "./errorHandler";
import config from "../config";
import { ENVIRONMENT } from "../shared/constants";

const { env } = config;
const middlewares = [
  responseTime(),
  logger(env === ENVIRONMENT.test ? () => {} : undefined),
  helmet(helmetOptions),
  respond(respondOptions),
  bodyParser(bodyParserOptions),
  cors(corsOptions),
  errorHandler,
];

export default () => compose(...middlewares);

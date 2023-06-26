import { ConfigInterface } from "./interfaces";
import { ENVIRONMENT } from "./shared/constants";

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env";

require("dotenv").config({ path: envFile });

const common: ConfigInterface = {
  env: (process.env.NODE_ENV as ENVIRONMENT) || ENVIRONMENT.development,
  host: process.env.HOST,
  port: Number(process.env.PORT),
  server_url: process.env.SERVER_URL,
  beam_api_url: process.env.BEAM_API_URL,
  beam_api_port: Number(process.env.BEAM_API_PORT),
  redis_url: process.env.REDIS_URL,
  redis_port: Number(process.env.REDIS_PORT),
  beam_node_url: process.env.BEAM_NODE_URL,
  db_name: process.env.DB_NAME,
  db_host: process.env.DB_HOST,
};

const development: ConfigInterface = {
  ...common,
};

const staging: ConfigInterface = {
  ...common,
};

const production: ConfigInterface = {
  ...common,
};

const test: ConfigInterface = {
  ...common,
};

interface EnvConfigInterface {
  [key: string]: ConfigInterface;
}

const config: EnvConfigInterface = {
  staging,
  development,
  production,
  test,
};

export default config[process.env.NODE_ENV || "development"];

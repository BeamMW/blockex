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

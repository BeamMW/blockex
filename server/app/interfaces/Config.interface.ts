import { ENVIRONMENT } from "../shared/constants";

export interface ConfigInterface {
  env: ENVIRONMENT;
  host: string;
  port: number;
  server_url: string;
  beam_api_url: string;
}

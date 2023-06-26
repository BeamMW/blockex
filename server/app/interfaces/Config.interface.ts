import { ENVIRONMENT } from "../shared/constants";

export interface ConfigInterface {
  env: ENVIRONMENT;
  host: string;
  port: number;
  server_url: string;
  beam_api_url: string;
  beam_api_port: number;
  redis_url: string;
  redis_port: number;
  beam_node_url: string;
  db_name: string;
  db_host: string;
}

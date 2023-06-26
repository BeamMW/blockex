import axios from "axios";

import config from "../../config";

export interface BeamRequestBaseModel {
  jsonrpc: string;
  id: number;
  method: string;
  params?: unknown;
}

interface BeamRequestOptions<T> {
  url: string;
  method: string;
  headers: {
    "Content-Type": string;
  };
  data: T;
}

export async function sendRequest<Req, Resp>(params: Req): Promise<Resp> {
  const options: BeamRequestOptions<Req> = {
    url: config.beam_api_url,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: params,
  };

  const response = await axios(options);

  return response.data.result as Resp;
}

export async function sendExplorerNodeRequest<Req>(query: string): Promise<any> {
  const options = {
    url: `http://${config.beam_node_url}${query}`,
    method: "GET",
  };

  const response = await axios(options);

  return response.data;
}

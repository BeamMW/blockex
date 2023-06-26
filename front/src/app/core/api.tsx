const API_URL = "https://explorer-api.beam.mw/dappnet/api/v1";

async function callApi(route: string) {
  //status check
  const response = await fetch(route);
  const formattedResponse = await response.json();
  return formattedResponse.data;
}

export async function LoadBlocks(page: number = 0, perPage: number = 20) {
  return await callApi(`${API_URL}/blocks?page=${page}&per_page=${perPage}`);
}

export async function LoadBlock(hash: string) {
  return await callApi(`${API_URL}/block?&hash=${hash}`);
}

export async function LoadStatus() {
  return await callApi(`${API_URL}/status`);
}

export async function LoadContracts(page: number = 0, perPage: number = 20) {
  return await callApi(`${API_URL}/contracts?page=${page}&per_page=${perPage}`);
}

export async function LoadContract(cid: string, page: number = 0, perPage: number = 50) {
  return await callApi(`${API_URL}/contract?id=${cid}&page=${page}&per_page=${perPage}`);
}

export async function LoadAssets(page: number = 0, perPage: number = 50) {
  return await callApi(`${API_URL}/assets?&page=${page}&per_page=${perPage}`);
}

export async function LoadAllAssets() {
  return await callApi(`${API_URL}/all_assets`);
}
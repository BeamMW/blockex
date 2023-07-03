const API_URL = "https://explorer-api.beam.mw/dappnet/api/v1";

async function callApi(route: string) {
  //status check
  const response = await fetch(route);
  const formattedResponse = await response.json();
  return formattedResponse.data;
}

export async function LoadBlocks(params: {page?: number, perPage?: number, timestamp?: number}) {
  if (params.page) {
    params.page = params.page - 1;
  }

  if (!params.perPage) {
    params.perPage = 20;
  }
  return await callApi(`${API_URL}/blocks?per_page=${params.perPage}${params.timestamp ? `&timestamp=${params.timestamp}` : ''}${params.page !== undefined ? `&page=${params.page}` : ''}`);
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
  return await callApi(`${API_URL}/assets?page=${page}&per_page=${perPage}`);
}

export async function LoadAllAssets() {
  return await callApi(`${API_URL}/all_assets`);
}

export async function BlockSearch(string: string) {
  return (await callApi(`${API_URL}/block_search?string=${string}`)) as [];
}

export async function ContractSearch(string: string) {
  return (await callApi(`${API_URL}/contract_search?string=${string}`)) as [];
}

export async function AssetSearch(string: string) {
  return (await callApi(`${API_URL}/asset_search?string=${string}`)) as [];
}
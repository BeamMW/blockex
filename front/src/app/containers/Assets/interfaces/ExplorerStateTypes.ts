export interface AppStateType {
  blocksData: BlocksData;
  contractsData: ContractsData;
  status: Status;
}

export interface Block {
  hash: string,
  height: number,
  timestamp: number,
  difficulty: number,
  inputsCount: number,
  outputsCount: number,
  kernelsCount: number,
  fee: number,
}

export interface BlocksData {
  blocks: Block[],
  page: number,
  pages: number,
  count: number,
}

export interface LockedFunds {
  aid: number,
  value: number,
}

export interface OwnedAssets {
  aid: number,
  metadata: string,
  value: number,
}

export interface VersionHistory {
  version: string,
  height: number,
}

export interface Contract {
  cid: string,
  kind: string,
  height: number,
  locked_funds: LockedFunds[],
  owned_assets: OwnedAssets[],
  version_history: VersionHistory[],
}

export interface ContractsData {
  contracts: Contract[],
  page: number,
  pages: number,
  count: number,
}

export interface Status {
  height: number,
  timestamp: number,
  total_coins_emission: number,
  next_treasury_emission_height: number,
  coins_in_circulation_treasury: number,
  coins_in_circulation_mined: number,
  next_treasury_coins_amount: number,
  difficulty: number,
}

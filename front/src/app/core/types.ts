export type Pallete = 'green' | 'ghost' | 'purple' | 'blue' | 'red' | 'white' | 'vote-red' | 'red-disc';

export type ButtonVariant = 'regular' | 'ghost' | 'ghostBordered' | 'block' | 'validate' |
  'link' | 'icon' | 'connect' | 'disconnect' | 'revoke';

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

  export interface Call {
    type: 'single' | 'group',
    value: any[],
  }
  
  export interface Contract {
    cid: string,
    kind: string,
    height: number,
    locked_funds: LockedFunds[],
    owned_assets: OwnedAssets[],
    version_history: VersionHistory[],
    calls_count: number,
    calls?: Call[],
    state?: {},
  }
  
  export interface ContractsData {
    contracts: Contract[],
    page: number,
    pages: number,
    count: number,
  }

  export interface ContractData extends Contract {
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

  export interface Asset {
    aid: number,
    cid: string,
    lock_height: number,
    metadata: string,
    owner: string,
    value: number,
    asset_history: any
  }

  export interface AssetsData {
    assets: Asset[],
    page: number,
    pages: number,
    count: number,
  }
  
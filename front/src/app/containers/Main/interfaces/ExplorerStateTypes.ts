import { BlocksData, ContractsData, Status } from '@core/types';

export interface AppStateType {
  blocksData: BlocksData;
  contractsData: ContractsData;
  status: Status;
}

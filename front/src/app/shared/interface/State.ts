import { SharedStateType } from '@app/shared/interface/SharedStateType';
import { ContractsState } from '@app/containers/Contracts/interfaces';

export interface AppState {
  shared: SharedStateType;
  main: any;
  contracts: ContractsState
}

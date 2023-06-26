import { SharedStateType } from '@app/shared/interface/SharedStateType';
import { ContractsState } from '@app/containers/Contracts/interfaces';
import { AssetsStateType } from '@app/containers/Assets/interfaces';

export interface AppState {
  shared: SharedStateType;
  main: any;
  contracts: ContractsState;
  assets: AssetsStateType;
}

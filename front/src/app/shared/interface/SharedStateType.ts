import { Asset, Status, BlocksData, SearchState } from '@core/types';

export interface SharedStateType {
  routerLink: string;
  errorMessage: string | null;
  isLoaded: boolean;
  assetsList: Asset[]
  status: Status;
  searchState: SearchState;
}

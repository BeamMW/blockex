import { AnyAction, combineReducers } from 'redux';
import { AppState } from '@app/shared/interface';
import { SharedReducer } from '@app/shared/store/reducer';
import { MainReducer } from '@app/containers/Main/store/reducer';
import { ContractsReducer } from '@app/containers/Contracts/store/reducer';
import { AssetsReducer } from '@app/containers/Assets/store/reducer';

export default () => {
  const appReducer = combineReducers({
    shared: SharedReducer,
    main: MainReducer,
    contracts: ContractsReducer,
    assets: AssetsReducer,
  });

  return (state: AppState | undefined, action: AnyAction) => appReducer(state, action);
};

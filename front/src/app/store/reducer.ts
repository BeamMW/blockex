import { AnyAction, combineReducers } from 'redux';
import { AppState } from '@app/shared/interface';
import { SharedReducer } from '@app/shared/store/reducer';
import { MainReducer } from '@app/containers/Main/store/reducer';

export default () => {
  const appReducer = combineReducers({
    shared: SharedReducer,
    main: MainReducer,
  });

  return (state: AppState | undefined, action: AnyAction) => appReducer(state, action);
};

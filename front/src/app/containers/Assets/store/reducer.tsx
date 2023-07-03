import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { AssetsStateType } from '../interfaces';
import * as actions from './actions';
import { AssetsData } from '@core/types';

type Action = ActionType<typeof actions>;

const initialState: AssetsStateType = {
  assetsData: {
    assets: [],
    page: 0,
    pages: 0,
    count: 0,
  }
};

const reducer = createReducer<AssetsStateType, Action>(initialState)
  .handleAction(actions.setAssetsData, (state, action) => produce(state, (nexState) => {
    nexState.assetsData = action.payload;
  }))
export { reducer as AssetsReducer };

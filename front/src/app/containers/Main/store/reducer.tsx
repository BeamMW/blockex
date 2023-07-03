import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { AppStateType } from '../interfaces';
import * as actions from './actions';

type Action = ActionType<typeof actions>;

const initialState: AppStateType = {
  blocksData: {
    blocks: [],
    count: 0,
    page: 0,
    pages: 0,
  }
};

const reducer = createReducer<AppStateType, Action>(initialState)
  .handleAction(actions.setBlocksData, (state, action) => produce(state, (nexState) => {
    nexState.blocksData = action.payload;
  }))
export { reducer as MainReducer };

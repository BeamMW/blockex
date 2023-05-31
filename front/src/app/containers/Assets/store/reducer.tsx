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
  },
  contractsData: {
    contracts: [],
    count: 0,
    page: 0,
    pages: 0,
  },
  status: {
    height: 0,
    difficulty: 0,
    coins_in_circulation_mined: 0,
    coins_in_circulation_treasury: 0,
    total_coins_emission: 0,
    next_treasury_coins_amount: 0,
    next_treasury_emission_height: 0,
    timestamp: 0,
  },
};

const reducer = createReducer<AppStateType, Action>(initialState)
  .handleAction(actions.setBlocksData, (state, action) => produce(state, (nexState) => {
    nexState.blocksData = action.payload;
  }))
  .handleAction(actions.setContractsData, (state, action) => produce(state, (nexState) => {
    nexState.contractsData = action.payload;
  }))
  .handleAction(actions.setStatusData, (state, action) => produce(state, (nexState) => {
    nexState.status = action.payload;
  }))
export { reducer as MainReducer };

import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { ContractsData } from '@core/types';
import * as actions from './actions';
import { ContractsState } from '../interfaces';

type Action = ActionType<typeof actions>;

const initialState: ContractsState = {
  contractsData: {
    contracts: [],
    count: 0,
    page: 0,
    pages: 0,
  },
};

const reducer = createReducer<ContractsState, Action>(initialState)
  .handleAction(actions.setContractsData, (state, action) => produce(state, (nexState) => {
    nexState.contractsData = action.payload;
  }))
export { reducer as ContractsReducer };

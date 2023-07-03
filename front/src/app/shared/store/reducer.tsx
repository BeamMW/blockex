import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { SharedStateType } from '../interface';
import * as actions from './actions';
import { parseMetadata } from '@core/appUtils';

type Action = ActionType<typeof actions>;

const initialState: SharedStateType = {
  routerLink: '',
  errorMessage: null,
  isLoaded: null,
  assetsList: [],
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
  searchState: {
    loading: false,
    results: [],
    value: ''
  }
};

const reducer = createReducer<SharedStateType, Action>(initialState)
  .handleAction(actions.navigate, (state, action) => produce(state, (nexState) => {
    nexState.routerLink = action.payload;
  }))
  .handleAction(actions.setAllAssetsData, (state, action) => produce(state, (nexState) => {
    nexState.assetsList = action.payload.map(item => {
      item.metadata = parseMetadata(item.metadata);
      return item;
    });
  }))
  .handleAction(actions.setStatusData, (state, action) => produce(state, (nexState) => {
    nexState.status = action.payload;
  }))
  .handleAction(actions.setIsLoaded, (state, action) => produce(state, (nexState) => {
    nexState.isLoaded  = action.payload;
  }))
  .handleAction(actions.searchCleanQuery, (state, action) => produce(state, (nexState) => {
    nexState.searchState = initialState.searchState;
  }))
  .handleAction(actions.searchStart, (state, action) => produce(state, (nexState) => {
    nexState.searchState = {loading: true, value: action.payload.value};
  }))
  .handleAction(actions.searchFinish, (state, action) => produce(state, (nexState) => {
    nexState.searchState = {loading: false, results: action.payload.results};
  }))
  .handleAction(actions.searchUpdateSelection, (state, action) => produce(state, (nexState) => {
    nexState.searchState = {value: action.payload.value};
  }));

export { reducer as SharedReducer };

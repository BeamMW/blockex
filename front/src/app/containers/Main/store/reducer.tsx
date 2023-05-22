import produce from 'immer';
import { ActionType, createReducer } from 'typesafe-actions';

import { AppStateType } from '../interfaces';
import * as actions from './actions';

type Action = ActionType<typeof actions>;

const initialState: AppStateType = {
  blocks: [],

  // bridgeTransactions: [],
  isLoggedIn: false,
  // balance: [],
  isLocked: false,
  isApproveInProgress: false,
  isTrInProgress: false,
  popupsState: {
    account: false,
    install: false
  },
  rate: null,
  isDonateInProgress: false,
  donatedBeam: 0,
  donatedBeamX: 0
};

const reducer = createReducer<AppStateType, Action>(initialState)
  .handleAction(actions.setBlocks, (state, action) => produce(state, (nexState) => {
    nexState.blocks = action.payload;
  }))


  .handleAction(actions.setIsLoggedIn, (state, action) => produce(state, (nexState) => {
    nexState.isLoggedIn = action.payload;
  }))
  .handleAction(actions.setIsLocked, (state, action) => produce(state, (nexState) => {
    nexState.isLocked = action.payload;
  }))
  // .handleAction(actions.loadAppParams.success, (state, action) => produce(state, (nexState) => {
  //   nexState.balance = action.payload;
  // }))
  .handleAction(actions.setPopupState, (state, action) => produce(state, (nexState) => {
    nexState.popupsState[action.payload.type] = action.payload.state;
  }))
  .handleAction(actions.loadRate.success, (state, action) => produce(state, (nexState) => {
    nexState.rate = action.payload;
  }))
  .handleAction(actions.setIsTrInProgress, (state, action) => produce(state, (nexState) => {
    nexState.isTrInProgress = action.payload;
  }))
  .handleAction(actions.setIsApproveInProgress, (state, action) => produce(state, (nexState) => {
    nexState.isApproveInProgress = action.payload;
  }))

export { reducer as MainReducer };

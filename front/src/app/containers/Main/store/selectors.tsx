import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';

const selectMain = (state: AppState) => state.main;
export const selectBlocks = () => createSelector(selectMain, (state) => state.blocks);

export const selectBalance = () => createSelector(selectMain, (state) => state.balance);
export const selectIsLoggedIn = () => createSelector(selectMain, (state) => state.isLoggedIn);
export const selectIsLocked = () => createSelector(selectMain, (state) => state.isLocked);
export const selectAppParams = () => createSelector(selectMain, (state) => state.appParams);
export const selectRate = () => createSelector(selectMain, (state) => state.rate);
export const selectPopupsState = () => createSelector(selectMain, (state) => state.popupsState);
export const selectIsTrInProgress = () => createSelector(selectMain, (state) => state.isTrInProgress);
export const selectIsApproveInProgress = () => createSelector(selectMain, (state) => state.isApproveInProgress);

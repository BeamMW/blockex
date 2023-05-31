import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';

const selectMain = (state: AppState) => state.main;
export const selectBlocksData = () => createSelector(selectMain, (state) => state.blocksData);
export const selectContractsData = () => createSelector(selectMain, (state) => state.contractsData);
export const selectStatusData = () => createSelector(selectMain, (state) => state.status);

// export const selectAppParams = () => createSelector(selectMain, (state) => state.appParams);
// export const selectRate = () => createSelector(selectMain, (state) => state.rate);

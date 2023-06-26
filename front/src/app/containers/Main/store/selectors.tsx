import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';

const selectMain = (state: AppState) => state.main;
export const selectBlocksData = () => createSelector(selectMain, (state) => state.blocksData);

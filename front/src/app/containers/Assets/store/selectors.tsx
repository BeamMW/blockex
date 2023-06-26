import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';

const selectAssets = (state: AppState) => state.assets;
export const selectAssetsData = () => createSelector(selectAssets, (state) => state.assetsData);

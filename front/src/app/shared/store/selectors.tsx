import { createSelector } from 'reselect';

import { AppState } from '../interface';

const selectShared = (state: AppState) => state.shared;

export const selectRouterLink = () => createSelector(selectShared, (state) => state.routerLink);
export const selectErrorMessage = () => createSelector(selectShared, (state) => state.errorMessage);
export const selectIsLoaded = () => createSelector(selectShared, (state) => state.isLoaded);
export const selectAllAssets = () => createSelector(selectShared, (state) => state.assetsList);
export const selectAssetById = (id: number) => createSelector(selectShared, (state) => {
    return state.assetsList.find((asset) => asset.aid === id);
});
export const selectStatusData = () => createSelector(selectShared, (state) => state.status);

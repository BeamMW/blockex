import { createSelector } from 'reselect';

import { AppState } from '../interface';

const selectShared = (state: AppState) => state.shared;

export const selectRouterLink = () => createSelector(selectShared, (state) => state.routerLink);
export const selectErrorMessage = () => createSelector(selectShared, (state) => state.errorMessage);
export const selectSystemState = () => createSelector(selectShared, (state) => state.systemState);
export const selectIsLoaded = () => createSelector(selectShared, (state) => state.isLoaded);
export const selectTransactions = () => createSelector(selectShared, (state) => state.transactions);
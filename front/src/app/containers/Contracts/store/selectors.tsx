import { createSelector } from 'reselect';
import { AppState } from '../../../shared/interface';

const selectContracts = (state: AppState) => state.contracts;
export const selectContractsData = () => createSelector(selectContracts, (state) => state.contractsData);

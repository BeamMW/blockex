import { createAsyncAction, createAction } from 'typesafe-actions';
import { ContractsData } from '@core/types';

export const setContractsData = createAction('@@MAIN/SET_CONTRACTS_DATA')<ContractsData>();

export const loadAppParams = createAsyncAction(
    '@@MAIN/LOAD_PARAMS',
    '@@MAIN/LOAD_PARAMS_SUCCESS',
    '@@MAIN/LOAD_PARAMS_FAILURE',
)<any, any, any>();

import { createAsyncAction, createAction } from 'typesafe-actions';
import { Contract } from '@core/types';

export const setContractData = createAction('@@MAIN/SET_CONTRACT_DATA')<Contract>();

export const loadAppParams = createAsyncAction(
    '@@MAIN/LOAD_PARAMS',
    '@@MAIN/LOAD_PARAMS_SUCCESS',
    '@@MAIN/LOAD_PARAMS_FAILURE',
)<any, any, any>();

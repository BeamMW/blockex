import { createAsyncAction, createAction } from 'typesafe-actions';
import { BlocksData, ContractsData, Status } from '../interfaces';

export const setBlocksData = createAction('@@MAIN/SET_BLOCKS')<BlocksData>();
export const setContractsData = createAction('@@MAIN/SET_CONTRACTS')<ContractsData>();
export const setStatusData = createAction('@@MAIN/SET_STATUS')<Status>();

export const loadAppParams = createAsyncAction(
    '@@MAIN/LOAD_PARAMS',
    '@@MAIN/LOAD_PARAMS_SUCCESS',
    '@@MAIN/LOAD_PARAMS_FAILURE',
)<any, any, any>();

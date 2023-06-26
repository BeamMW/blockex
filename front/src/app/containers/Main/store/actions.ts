import { createAsyncAction, createAction } from 'typesafe-actions';
import { BlocksData } from '@core/types';

export const setBlocksData = createAction('@@MAIN/SET_BLOCKS')<BlocksData>();

export const loadAppParams = createAsyncAction(
    '@@MAIN/LOAD_PARAMS',
    '@@MAIN/LOAD_PARAMS_SUCCESS',
    '@@MAIN/LOAD_PARAMS_FAILURE',
)<any, any, any>();

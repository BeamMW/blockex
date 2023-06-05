import { createAsyncAction, createAction } from 'typesafe-actions';
import { AssetsData } from '@core/types';

export const setAssetsData = createAction('@@MAIN/SET_BLOCKS')<AssetsData>();

export const loadAppParams = createAsyncAction(
    '@@MAIN/LOAD_PARAMS',
    '@@MAIN/LOAD_PARAMS_SUCCESS',
    '@@MAIN/LOAD_PARAMS_FAILURE',
)<any, any, any>();

import { createAsyncAction, createAction } from 'typesafe-actions';
import { AssetsData, Asset } from '@core/types';

export const setAssetsData = createAction('@@MAIN/SET_ASSETS_DATA')<AssetsData>();

export const loadAssets = createAsyncAction(
    '@@MAIN/LOAD_ASSETS',
    '@@MAIN/LOAD_ASSETS_SUCCESS',
    '@@MAIN/LOAD_ASSETS_FAILURE',
)<any, any, any>();

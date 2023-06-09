import { createAction } from 'typesafe-actions';
import { SharedActionTypes } from './constants';
import { Asset, Status } from '@core/types';

export const navigate = createAction(SharedActionTypes.NAVIGATE)<string>();
export const setError = createAction(SharedActionTypes.SET_ERROR)<string | null>();
export const setAllAssetsData = createAction('@@MAIN/SET_ALL_ASSETS')<Asset[]>();
export const setStatusData = createAction('@@MAIN/SET_STATUS')<Status>();
export const setIsLoaded = createAction('@@SHARED/SET_IS_LOADED')<boolean>();
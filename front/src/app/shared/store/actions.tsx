import { createAction } from 'typesafe-actions';
import { SharedActionTypes } from './constants';
import { Asset, Status, SearchState } from '@core/types';

export const navigate = createAction(SharedActionTypes.NAVIGATE)<string>();
export const setError = createAction(SharedActionTypes.SET_ERROR)<string | null>();
export const setAllAssetsData = createAction('@@MAIN/SET_ALL_ASSETS')<Asset[]>();
export const setStatusData = createAction('@@MAIN/SET_STATUS')<Status>();
export const setIsLoaded = createAction('@@SHARED/SET_IS_LOADED')<boolean>();

export const searchCleanQuery = createAction('@@SHARED/SEARCH_CLEAN_QUERY')();
export const searchStart = createAction('@@SHARED/SEARCH_START')<SearchState>();
export const searchFinish = createAction('@@SHARED/SEARCH_FINISH')<SearchState>();
export const searchUpdateSelection = createAction('@@SHARED/SEARCH_UPDATE_SELECTION')<SearchState>();
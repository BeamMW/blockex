import { call, put, takeLatest, select } from 'redux-saga/effects';
import { actions } from '.';
import {  } from '@core/types';

export function* loadContractsParamsSaga(
    action: ReturnType<typeof actions.loadAppParams.request>,
  ) : Generator {
    yield put(actions.loadAppParams.success([]));
}

function* contractsSaga() {
    yield takeLatest(actions.loadAppParams.request, loadContractsParamsSaga);
    // yield takeLatest(actions.loadRate.request, loadRate);
}

export default contractsSaga;

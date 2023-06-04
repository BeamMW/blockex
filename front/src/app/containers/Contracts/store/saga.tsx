import { call, put, takeLatest, select } from 'redux-saga/effects';
import { actions } from '.';
import store from '../../../../index';
import { selectSystemState } from '@app/shared/store/selectors';
// import { Balance, Currency } from '@app/core/types';
import { ethId } from '@app/shared/constants';
import { LoadBlocks, LoadStatus, LoadContracts } from '@core/api';
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

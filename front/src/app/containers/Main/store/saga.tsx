import { call, put, takeLatest, select } from 'redux-saga/effects';
import { actions } from '.';
import store from '../../../../index';
import { selectSystemState } from '@app/shared/store/selectors';
// import { Balance, Currency } from '@app/core/types';
import { CURRENCIES, ethId } from '@app/shared/constants';

// const FETCH_INTERVAL = 310000;
// const PRICE_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
// const RESERVE_PRICE_API_URL = 'https://explorer-api.beam.mw/bridges/rates';

async function loadBlocks() {
  const response = await fetch(`http://127.0.0.1:4000/api/v1/blocks?page=0&per_page=20`);
  const formattedResponse = await response.json();
  return formattedResponse.data;
}

async function loadStatus() {
  const response = await fetch(`http://127.0.0.1:4000/api/v1/status`);
  const formattedResponse = await response.json();
  return formattedResponse.data;
}

export function* loadParamsSaga(
    action: ReturnType<typeof actions.loadAppParams.request>,
  ) : Generator {
    // const systemState = (yield select(selectSystemState())) as {account: string};
    const blocks = yield call(loadBlocks);
    yield put(actions.setBlocks(blocks as []));

    const status = yield call(loadStatus);
    console.log(status);

    yield put(actions.loadAppParams.success([]));
}

// async function loadRatesApiCall(rate_ids) {
//   let response;
//   try {
//     response = await fetch(`${PRICE_API_URL}?ids=${rate_ids.join(',')}&vs_currencies=usd`);
//   } catch (e) {
//     response = await fetch(RESERVE_PRICE_API_URL);
//   }
//   const promise = await response.json();
//   return promise;
// }

// export function* loadRate() {
//   try {
//     let rate_ids = [];
//     for (let curr of CURRENCIES) {
//       rate_ids.push(curr.rate_id);
//     }
//     rate_ids.push('beam');
//     const result = yield call(loadRatesApiCall, rate_ids);

//     yield put(actions.loadRate.success(result));
//     setTimeout(() => store.dispatch(actions.loadRate.request()), FETCH_INTERVAL);
//   } catch (e) {
//     yield put(actions.loadRate.failure(e));
//   }
// }

function* mainSaga() {
    yield takeLatest(actions.loadAppParams.request, loadParamsSaga);
    // yield takeLatest(actions.loadRate.request, loadRate);
}

export default mainSaga;

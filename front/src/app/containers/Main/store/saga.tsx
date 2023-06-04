import { call, put, takeLatest, select } from 'redux-saga/effects';
import { actions } from '.';
import store from '../../../../index';
import { selectSystemState } from '@app/shared/store/selectors';
// import { Balance, Currency } from '@app/core/types';
import { CURRENCIES, ethId } from '@app/shared/constants';
import { LoadBlocks, LoadStatus, LoadContracts } from '@core/api';
import { BlocksData, ContractsData, Status } from '@core/types';

// const FETCH_INTERVAL = 310000;
// const PRICE_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
// const RESERVE_PRICE_API_URL = 'https://explorer-api.beam.mw/bridges/rates';


export function* loadParamsSaga(
    action: ReturnType<typeof actions.loadAppParams.request>,
  ) : Generator {
    // const systemState = (yield select(selectSystemState())) as {account: string};
    // const blocksData = (yield call(LoadBlocks)) as BlocksData;
    // yield put(actions.setBlocksData(blocksData));

    const contractsData = (yield call(LoadContracts)) as ContractsData;
    yield put(actions.setContractsData(contractsData));

    const statusData = (yield call(LoadStatus)) as Status;
    yield put(actions.setStatusData(statusData));

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

import {
  call, take, fork, takeLatest, put, select
} from 'redux-saga/effects';

import { eventChannel, END } from 'redux-saga';
import { actions as mainActions } from '@app/containers/Main/store/index';
import { navigate } from '@app/shared/store/actions';
import store from '../../../index';
import { actions } from '.';

import { LoadBlocks, LoadStatus, LoadAllAssets } from '@core/api';
import { BlocksData, ContractsData, Status, Asset } from '@core/types';

// import { actions } from '@app/shared/store/index';
// import { ROUTES, CURRENCIES, ethId } from '@app/shared/constants';
// import { setIsLocked, setIsLoggedIn, setPopupState } from '@app/containers/Main/store/actions';
// import delay from '@redux-saga/delay-p';


// function initApp(account: string) {
//   store.dispatch(setAccountState(account));
//   store.dispatch(setIsLoggedIn(true));
//   metaMaskController.init();
//   store.dispatch(mainActions.loadRate.request());
// }

export function remoteEventChannel() {
  return eventChannel((emitter) => {
    setTimeout(()=>emitter({event: 'account_loaded'}), 0)
    const unsubscribe = () => {
      emitter(END);
    };

    return unsubscribe;
  });
}


// export function* handleTransactions(payload, isTimeout: boolean = false) {
//   let result = [];
//   try {
//     for (var item of CURRENCIES) {
//       const trs = yield call(metaMaskController.loadTransactions, payload, 
//         item.id == ethId ? item.ethPipeContract : item.ethTokenContract, item.id);
//       result = result.concat(trs);
//     }
//   } catch (e) {
//     console.log(e);
//   }
//   yield put(actions.setTransactions(result));
//   store.dispatch(mainActions.loadAppParams.request(null));

//   if (isTimeout) {
//     yield delay(5000);
//     yield call(handleTransactions, payload, true);
//   }
// }

function* sharedSaga() {  
  const statusData = (yield call(LoadStatus)) as Status;
  yield put(actions.setStatusData(statusData));

  const allAssets = (yield call(LoadAllAssets)) as Asset[];
  yield put(actions.setAllAssetsData(allAssets));

  yield put(actions.setIsLoaded(true));

  const remoteChannel = yield call(remoteEventChannel);
  // store.dispatch(mainActions.loadAppParams.request(null));
  while (true) {
    try {
      const payload: any = yield take(remoteChannel);
  //     // if (localStorage.getItem('locked')) {
  //     //   store.dispatch(setIsLocked(true));
  //     // }
  //     console.log(payload)
      switch (payload.event) {
        case 'account_loaded':
          store.dispatch(mainActions.loadAppParams.request(null));
  //         // if (payload.data.length === 0) {
  //         //   store.dispatch(setIsLoggedIn(false));
  //         //   const wasReloaded = localStorage.getItem('wasReloaded');
  //         //   if (wasReloaded) {
  //         //     metaMaskController.connect();
  //         //     localStorage.removeItem('wasReloaded');
  //         //   }
  //         //   yield put(navigate(ROUTES.MAIN.CONNECT));
  //         // } else {
  //         //   store.dispatch(setIsCorrectNetwork(window.ethereum.networkVersion === MAINNET_CHAIN_ID));
  //         //   initApp(payload.data[0]);
  //         //   yield fork(handleTransactions, payload.data[0], true);
  //         // }

  //         break;
        default:
          break;
      }
    } catch (err) {
      remoteChannel.close();
    }
  }
}

export default sharedSaga;

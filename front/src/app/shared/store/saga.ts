import {
  call, take, fork, takeLatest, put, select, delay, takeEvery
} from 'redux-saga/effects';

import { eventChannel, END } from 'redux-saga';
import { actions as mainActions } from '@app/containers/Main/store/index';
import { navigate } from '@app/shared/store/actions';
import store from '../../../index';
import { actions } from '.';

import { LoadStatus, LoadAllAssets } from '@core/api';
import { BlocksData, ContractsData, Status, Asset } from '@core/types';

const WS_URL = 'wss://explorer-api.beam.mw/mainnet/ws/';

function createWebSocketConnection() {
  return new WebSocket(WS_URL);
}

function createWebSocketChannel(socket) {
  return eventChannel((emitter) => {
    socket.onopen = () => {
      emitter({ type: 'OPEN' });
    };

    socket.onmessage = (event) => {
      emitter({ type: 'MESSAGE', payload: event.data });
    };

    socket.onerror = (error) => {
      emitter({ type: 'ERROR', payload: error });
    };

    socket.onclose = (event) => {
      emitter({ type: 'CLOSE', payload: event });
    };

    // Return the unsubscribe function
    return () => {
      socket.close();
    };
  });
}

function* handleWebSocket() {
  const socket = yield call(createWebSocketConnection);
  const channel = yield call(createWebSocketChannel, socket);

  while (true) {
    try {
      const action = yield take(channel);
      switch (action.type) {
        case 'ERROR':
        case 'CLOSE':
          yield put(actions.setIsLoaded(false));
          yield call(reconnectWebSocket);
          break;
        case 'MESSAGE':
          const message = JSON.parse(action.payload);
          if (message.status) {
            const statusData = (yield call(LoadStatus)) as Status;
            yield put(actions.setStatusData(statusData));
    
            const allAssets = (yield call(LoadAllAssets)) as Asset[];
            yield put(actions.setAllAssetsData(allAssets));
    
            yield put(actions.setIsLoaded(true));
          }
          break;
      }
      yield put(action);
    } catch (error) {
      console.log("HANDLE ERROR!", error)
      // Handle error
    }
  }
}

function* connectWebSocket() {
  yield fork(handleWebSocket);
}

function* reconnectWebSocket() {
  const DELAY_BETWEEN_RETRIES = 2000; // 2 seconds

  yield delay(DELAY_BETWEEN_RETRIES);
  try {
    yield call(connectWebSocket);
    return; // Reconnection successful, exit the saga
  } catch (error) {
      // Handle conection error
  }
}

function* sharedSaga() {
  yield call(connectWebSocket);
}

export default sharedSaga;

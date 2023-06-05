import { call, put, takeLatest, select } from 'redux-saga/effects';
import { actions } from '.';

export function* loadParamsSaga(
    action: ReturnType<typeof actions.loadAppParams.request>,
  ) : Generator {
    // const systemState = (yield select(selectSystemState())) as {account: string};
    yield put(actions.loadAppParams.success([]));
}

function* mainSaga() {
    yield takeLatest(actions.loadAppParams.request, loadParamsSaga);
}

export default mainSaga;

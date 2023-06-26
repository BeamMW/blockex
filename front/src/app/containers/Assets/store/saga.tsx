import { call, put, takeLatest, select } from 'redux-saga/effects';
import { actions } from '.';
import { LoadAssets } from '@core/api';
import { AssetsData, Asset } from '@app/core/types';
import store from '../../../../index';
import { parseMetadata } from '@core/appUtils';
import { selectAssetById } from '@app/shared/store/selectors';

export function* loadAssetsSaga(
    action: ReturnType<typeof actions.loadAssets.request>,
  ) : Generator {
    // const { assetsList } = store.getState().shared;
    const assetsByPage = (yield call(LoadAssets, action.payload - 1)) as any;

    for (const index of assetsByPage.assets.keys()) {
      assetsByPage.assets[index] = yield select(selectAssetById(assetsByPage.assets[index].aid));
    }

    yield put(actions.setAssetsData(assetsByPage));
    yield put(actions.loadAssets.success([]));
}

function* assetsSaga() {
    yield takeLatest(actions.loadAssets.request, loadAssetsSaga);
}

export default assetsSaga;

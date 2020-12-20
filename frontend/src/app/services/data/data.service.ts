import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';

import { Block, Asset, Offer } from '../../models';

const SEPARATOR = ';';
const enum PARAMS {
  ASSET_NAME = 'N=',
  ASSET_CODE = 'SN=',
  UNIT_NAME = 'UN=',
  SM_UNIT_NAME = 'NTHUN=',
  SCHEMA_VERSION = 'SCH_VER=',
  RATIO = 'NTH_RATIO=',
  SHORT_DESC = 'OPT_SHORT_DESC=',
  LONG_DESC = 'OPT_LONG_DESC=',
  SITE_URL = 'OPT_SITE_URL=',
  PDF_URL = 'OPT_PDF_URL=',
  FAVICON_URL = 'OPT_FAVICON_URL=',
  LOGO_URL = 'OPT_LOGO_URL='
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  API_BASE = environment.apiBaseUrl;
  assetsList = [];
  public height: Subject<number>;

  constructor(private http: HttpClient) {
    this.height = new Subject<number>();
  }

  loadBlocks(page = 1): any {
    return this.http.get<Block[]>(this.API_BASE + '/explorer/blocks/' + '?page=' + (page + 1));
  }

  loadOffers(page = 1): any {
    return this.http.get<Offer[]>(this.API_BASE + '/explorer/get_swap_offers/?page=' + (page + 1));
  }

  searchBlock(query) {
    return this.http.get<any>(this.API_BASE + '/explorer/search/' + '?q=' + query);
  }

  loadBlock(hash) {
    return this.http.get<Block>(this.API_BASE + '/explorer/block/' + '?hash=' + hash);
  }

  getAssetsList(height = null) {
    const heightParam = (height !== null) ? '?height=' + height : '';
    return this.http.get<{assets: Asset[]}>(this.API_BASE + '/explorer/get_assets_list/' + heightParam);
  }

  loadAssets(data) {
    this.assetsList = data.assets.map(function(item) {
      const metadata = item.metadata;

      const assetNameIndex = metadata.indexOf(PARAMS.ASSET_NAME);
      const assetCodeIndex = metadata.indexOf(PARAMS.ASSET_CODE);
      const unitNameIndex = metadata.indexOf(PARAMS.UNIT_NAME);
      const smallestUnitNameIndex = metadata.indexOf(PARAMS.SM_UNIT_NAME);
      const schemaVersionIndex = metadata.indexOf(PARAMS.SCHEMA_VERSION);
      const ratioIndex = metadata.indexOf(PARAMS.RATIO);
      const shortDescIndex = metadata.indexOf(PARAMS.SHORT_DESC);
      const longDescIndex = metadata.indexOf(PARAMS.LONG_DESC);
      const siteUrlIndex = metadata.indexOf(PARAMS.SITE_URL);
      const pdfUrlIndex = metadata.indexOf(PARAMS.PDF_URL);
      const faviconUrlIndex = metadata.indexOf(PARAMS.FAVICON_URL);
      const logoUrlIndex = metadata.indexOf(PARAMS.LOGO_URL);

      const assetItem = {
          lock_height: item.lock_height,
          value: item.value_lo,
          id: item.id,
          asset_name: assetNameIndex > 0 ?
            metadata.slice(assetNameIndex + PARAMS.ASSET_NAME.length, metadata.indexOf(SEPARATOR, assetNameIndex)) : '',
          asset_code: assetCodeIndex > 0 ?
            metadata.slice(assetCodeIndex + PARAMS.ASSET_CODE.length, metadata.indexOf(SEPARATOR, assetCodeIndex)) : '',
          unit_name: unitNameIndex > 0 ?
            metadata.slice(unitNameIndex + PARAMS.UNIT_NAME.length, metadata.indexOf(SEPARATOR, unitNameIndex)) : '',
          smallest_unit_name: smallestUnitNameIndex > 0 ?
            metadata.slice(smallestUnitNameIndex + PARAMS.SM_UNIT_NAME.length,
            metadata.indexOf(SEPARATOR, smallestUnitNameIndex)) : '',
          schema_version: schemaVersionIndex > 0 ?
            metadata.slice(schemaVersionIndex + PARAMS.SCHEMA_VERSION.length,
              metadata.indexOf(SEPARATOR, schemaVersionIndex)) : '',
          ratio: ratioIndex > 0 ?
            metadata.slice(ratioIndex + PARAMS.RATIO.length, metadata.indexOf(SEPARATOR, ratioIndex)) : '',
          short_desc: shortDescIndex > 0 ?
            metadata.slice(shortDescIndex + PARAMS.SHORT_DESC.length, metadata.indexOf(SEPARATOR, shortDescIndex)) : '',
          full_desc: longDescIndex > 0 ?
            metadata.slice(longDescIndex + PARAMS.LONG_DESC.length, metadata.indexOf(SEPARATOR, longDescIndex)) : '',
          site_url: siteUrlIndex > 0 ?
            metadata.slice(siteUrlIndex + PARAMS.SITE_URL.length, metadata.indexOf(SEPARATOR, siteUrlIndex)) : '',
          pdf_url: pdfUrlIndex > 0 ?
            metadata.slice(pdfUrlIndex + PARAMS.PDF_URL.length, metadata.indexOf(SEPARATOR, pdfUrlIndex)) : '',
          favicon_url: faviconUrlIndex > 0 ?
            metadata.slice(faviconUrlIndex + PARAMS.FAVICON_URL.length, metadata.indexOf(SEPARATOR, faviconUrlIndex)) : '',
          logo_url: logoUrlIndex > 0 ?
            metadata.slice(logoUrlIndex + PARAMS.LOGO_URL.length, metadata.indexOf(SEPARATOR, logoUrlIndex)) : ''
      };

      return assetItem;
    });
  }
}

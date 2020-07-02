import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Router, NavigationExtras } from '@angular/router';
import { routesConsts } from '../consts';
import { DataService } from '../services';

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

@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.css']
})
export class AssetsListComponent implements OnInit {
  dataSource: any;
  displayedColumns: string[] = ['coin', 'id', 'lock_height', 'value', 'website'];
  loading_assets = true;
  count = 0;
  page = 0;
  assets = [];
  constructor(
    private dataService: DataService,
    private router: Router) { }

  ngOnInit() {
    this.dataService.loadAssetsList().subscribe((data) => {
      this.loading_assets = false;
      this.assets = data.assets.map(function(item) {
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
              metadata.slice(schemaVersionIndex + PARAMS.SCHEMA_VERSION.length, metadata.indexOf(SEPARATOR, schemaVersionIndex)) : '',
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

      this.count = this.assets.length;
      this.dataSource = new MatTableDataSource(this.assets.slice(0, 19));
    });
  }

  nextPage(event) {
    this.page = event ? event.pageIndex : 0;
    const lastCount = (this.page + 1) * 20;
    this.dataSource = new MatTableDataSource(this.assets.slice(lastCount - 19, lastCount));
  }

  websiteClicked(clickedUrl: string) {
    window.open(clickedUrl, '_blank');
  }

  coinClicked(coinData) {
    const navigationExtras: NavigationExtras = {
      state: coinData
    };
    this.router.navigate([routesConsts.CONFIDENTIAL_ASSET_DETAILS], navigationExtras);
  }

  createAssetClicked() {
    this.router.navigate([routesConsts.CONFIDENTIAL_ASSET_CREATE]);
  }
}

import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Router, NavigationExtras } from '@angular/router';
import { routesConsts } from '../consts';

@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.css']
})
export class AssetsListComponent implements OnInit {
  dataSource: any;
  displayedColumns: string[] = ['coin', 'description', 'website'];

  constructor(private router: Router) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource([{
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png',
      short_name: 'BEAM',
      coin: 'Beam coin',
      unit_name: 'Beam',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
      website: 'beam.mw',
      website_url: 'https://beam.mw',
      smallest_unit_name: 'Groth',
      descr_paper: 'docs.beam.mw/BEAM_Position_Paper_0.3.pdf',
      descr_paper_url: 'https://docs.beam.mw/BEAM_Position_Paper_0.3.pdf',
      coin_logo_url: 'https://beam.mw/themes/beam/assets/images/icons/logo.svg',
      ratio: 100000
    }, {
      logo_url: 'https://e7.pngegg.com/pngimages/159/845/png-clipart-ethereum-cryptocurrency-bitcoin-blockchain-logo-bitcoin-angle-triangle.png',
      short_name: 'RANDOM',
      coin: 'Random coin',
      unit_name: 'Random',
      description: 'Lorem ipsum tempor incididunt ut labore.',
      website: 'explorer.beam.mw',
      website_url: 'https://explorer.beam.mw',
      smallest_unit_name: 'Groth',
      descr_paper: 'docs.beam.mw/BEAM_Position_Paper_0.3.pdf',
      descr_paper_url: 'https://docs.beam.mw/BEAM_Position_Paper_0.3.pdf',
      coin_logo_url: 'https://beam.mw/themes/beam/assets/images/icons/logo.svg',
      ratio: 1000000000
    }, {
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png',
      short_name: 'HAHA',
      coin: 'Lol coin',
      unit_name: 'Haha',
      description: 'description.',
      website_url: 'https://somesite.mw',
      website: 'somesite.mw',
      smallest_unit_name: 'Groth',
      descr_paper: 'docs.beam.mw/BEAM_Position_Paper_0.3.pdf',
      descr_paper_url: 'https://docs.beam.mw/BEAM_Position_Paper_0.3.pdf',
      coin_logo_url: 'https://beam.mw/themes/beam/assets/images/icons/logo.svg',
      ratio: 1000000000000000
    }]);
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

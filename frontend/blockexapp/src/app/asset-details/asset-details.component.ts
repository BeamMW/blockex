import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routesConsts } from '../consts';

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.css']
})
export class AssetDetailsComponent implements OnInit {

  assetData: any;
  constructor(private router: Router) {
    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {
        logo_url: string,
        short_name: string,
        unit_name: string,
        coin: string,
        description: string,
        website: string,
        website_url: string,
        smallest_unit_name: string,
        descr_paper: string,
        descr_paper_url: string,
        ratio: number,
        coin_logo_url: string
      };
      this.assetData = state;

      if (state.logo_url === undefined) {
        this.router.navigate([routesConsts.CONFIDENTIAL_ASSETS_LIST]);
      }
    } catch (e) {
      this.router.navigate([routesConsts.CONFIDENTIAL_ASSETS_LIST]);
    }
  }

  ngOnInit() {
  }

}

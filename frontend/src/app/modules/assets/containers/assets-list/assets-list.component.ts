import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, Route } from '@angular/router';
import { routesConsts } from '../../../../consts';
import { DataService } from '../../../../services';
import { ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.scss']
})
export class AssetsListComponent implements OnInit {
  dataSource: any;
  displayedColumns: string[] = ['coin', 'id', 'value', 'description', 'website'];
  displayedColumnsMobile: string[] = ['coin', 'description', 'website'];
  loading_assets = true;
  isFullScreen = false;
  count = 0;
  page = 0;
  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router) {
      this.isFullScreen = window.innerWidth > 768;
  }
  fullDesc = 'BEAMX token is a Confidential Asset issued on top of the Beam blockchain with a fixed emission of 100,000,000 units (except for the lender of a "last resort" scenario).\
  BEAMX is the governance token for the BeamX DAO, managed by the BeamX DAO Core contract\
  Holders can earn BeamX tokens by participating in the DAO activities: providing liquidity to the DeFi applications governed by the DAO or participating in the governance process.'
  public iconBeamx: string = `../../../../../assets/beamx-icon.svg`;

  ngOnInit() {
    const assetsByHeight = this.route.snapshot.queryParamMap.get('height');

    this.dataService.getAssetsList(assetsByHeight).subscribe((data) => {
      this.loading_assets = false;
      this.dataService.loadAssets(data);
      this.count = this.dataService.assetsList.length;
      this.dataSource = new MatTableDataSource(this.dataService.assetsList.slice(0, 19));
    });
  }

  nextPage(event) {
    this.page = event ? event.pageIndex : 0;
    const lastCount = (this.page + 1) * 20;
    this.dataSource = new MatTableDataSource(this.dataService.assetsList.slice(lastCount - 19, lastCount));
  }

  websiteClicked(event, clickedUrl: string) {
    event.stopPropagation();
    window.open(clickedUrl, '_blank');
  }

  coinClicked(coinData) {
    console.log('ccc', coinData)
    this.router.navigate([routesConsts.CONFIDENTIAL_ASSET_DETAILS, coinData.id]);
  }

  createAssetClicked() {
    this.router.navigate([routesConsts.CONFIDENTIAL_ASSET_CREATE]);
  }
}

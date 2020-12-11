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
  loading_assets = true;
  count = 0;
  page = 0;
  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router) { }

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
    this.router.navigate([routesConsts.CONFIDENTIAL_ASSET_DETAILS, coinData.id]);
  }

  createAssetClicked() {
    this.router.navigate([routesConsts.CONFIDENTIAL_ASSET_CREATE]);
  }
}

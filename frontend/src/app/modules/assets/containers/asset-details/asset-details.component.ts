import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../../../services';

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.scss']
})
export class AssetDetailsComponent implements OnInit {
  assetData: any;
  assetLoaded = false;
  isFullScreen = false;
  constructor(private router: Router, private route: ActivatedRoute, private dataService: DataService) {
    this.isFullScreen = window.innerWidth > 768;
  }

  getAssetItem (id) {
    this.assetData = this.dataService.assetsList.find((item) => {
      return item.id === parseInt(id, 10);
    });

    this.assetLoaded = !!this.assetData;
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params.id !== undefined && this.dataService.assetsList.length > 0) {
        this.getAssetItem(params.id);
      } else if (params.id !== undefined && this.dataService.assetsList.length === 0) {
        this.dataService.getAssetsList().subscribe((data) => {
          this.dataService.loadAssets(data);
          this.getAssetItem(params.id);
        });
      }
    });
  }

}

import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services';
import { routesConsts } from '../../consts';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-assets-header',
  templateUrl: './assets-header.component.html',
  styleUrls: ['./assets-header.component.css']
})
export class AssetsHeaderComponent implements OnInit {

  isMainnet: boolean = false;
  isMasternet: boolean = false;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    this.isMasternet = environment.masternet;
    this.isMainnet = environment.production;
  }

  navigateToHomepage() {
      this.router.navigate([routesConsts.HOME]);
  }

  searchProcess(input) {
      this.dataService.getAssetsList().subscribe((data) => {
        this.dataService.loadAssets(data);
      });
      const searchValue = input.value.toLowerCase();
      input.value = '';

      const assetNameSearch = this.dataService.assetsList.find((item) => {
        return item.asset_name.toLowerCase().includes(searchValue);
      });

      if (assetNameSearch === undefined) {
        const descriptionSearch = this.dataService.assetsList.find((item) => {
          return item.full_desc.toLowerCase().includes(searchValue);
        });

        if (descriptionSearch === undefined) {
          const ratioSearch = this.dataService.assetsList.find((item) => {
            return item.ratio.toLowerCase().includes(searchValue);
          });

          if (ratioSearch !== undefined) {
            this.router.navigate([routesConsts.CONFIDENTIAL_ASSET_DETAILS, ratioSearch.id]);
          }
        } else {
          this.router.navigate([routesConsts.CONFIDENTIAL_ASSET_DETAILS, descriptionSearch.id]);
        }
      } else {
        this.router.navigate([routesConsts.CONFIDENTIAL_ASSET_DETAILS, assetNameSearch.id]);
      }
  }
}

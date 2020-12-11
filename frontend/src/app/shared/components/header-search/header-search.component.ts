import { Component, OnInit, Input } from '@angular/core';
import { DataService } from './../../../services';
import { Router } from '@angular/router';
import { routesConsts } from './../../../consts';

@Component({
  selector: 'app-header-search',
  templateUrl: './header-search.component.html',
  styleUrls: ['./header-search.component.scss']
})
export class HeaderSearchComponent implements OnInit {
  @Input() isAssetsVal: boolean;

  public placeholderVal: string;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.placeholderVal =  this.isAssetsVal ? 'Search by asset, description, ratio' : 'Search by height, hash, kernel ID';
  }

  onEventMethod(e): void {
    e.placeholder = this.placeholderVal;
  }

  searchProcess(input): void {
    const searchValue = input.value.toLowerCase();
    input.value = '';

    if (!this.isAssetsVal) {
      this.dataService.searchBlock(searchValue).subscribe((blockItem) => {
        if (blockItem.hash !== undefined){
          this.router.navigate([routesConsts.BLOCK_DETAILS, blockItem.hash], {queryParams: {searched_by: searchValue}});
        }
      });
    } else {
      this.dataService.getAssetsList().subscribe((data) => {
        this.dataService.loadAssets(data);
      });

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
}

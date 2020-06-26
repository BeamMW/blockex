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
      const searchValue = input.value;
      input.value = '';
      this.dataService.searchBlock(searchValue).subscribe((blockItem) => {
        if (blockItem.found !== undefined && !blockItem.found) {
          this.router.navigate([routesConsts.BLOCK_NOT_FOUND]);
        } else if (blockItem.hash !== undefined){
          this.router.navigate([routesConsts.BLOCK_DETAILS, blockItem.hash], {queryParams: {searched_by: searchValue}});
        }
      }, (error) => {
          this.router.navigate([routesConsts.BLOCK_NOT_FOUND]);
      });
  }
}

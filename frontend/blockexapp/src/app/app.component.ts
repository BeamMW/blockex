import { Component, OnInit } from '@angular/core';
import { DataService } from './services';
import { routesConsts } from './consts';
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  {
  title = 'app';

  constructor(private dataService: DataService, private router: Router) {

  }

  navigateToHomepage(){
      this.router.navigate(
          [routesConsts.HOME]
      );
  }

  searchProcess(searchValue) {
      this.dataService.searchBlock(searchValue).subscribe((blockItem) => {
        if (blockItem.found !== undefined && !blockItem.found) {
          this.router.navigate(
            [routesConsts.BLOCK_NOT_FOUND]
          );
        } else if (blockItem.hash !== undefined){
          this.router.navigate(
            [routesConsts.BLOCK_DETAILS, blockItem.hash]
          );
        }
      }, (error) => {
          this.router.navigate(
              [routesConsts.BLOCK_NOT_FOUND]
          );
      });
  }
}



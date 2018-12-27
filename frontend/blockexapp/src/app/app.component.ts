import { Component, OnInit } from '@angular/core';
import { DataService } from './services';
import { Observable, of} from 'rxjs';
import { map, delay, flatMap, concatAll, concatMap } from 'rxjs/operators';
import { Block } from './models';
import {MatPaginator, MatTableDataSource} from '@angular/material';
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
          ['/']
      );
  }

  searchProcess(searchValue) {
      this.dataService.searchBlock(searchValue).subscribe((blockItem) => {
          this.router.navigate(
              ['/block', blockItem.hash]
          );
      }, (error) => {
          this.router.navigate(
              ['/block', 'notfound']
          );
      });
  }
}



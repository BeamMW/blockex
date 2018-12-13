import { Component, OnInit } from '@angular/core';
import { DataService } from '../services';
import { Observable, of} from 'rxjs';
import { map, delay, flatMap, concatAll, concatMap } from 'rxjs/operators';
import { Block } from '../models';

import {MatPaginator, MatTableDataSource} from '@angular/material';
import {PageEvent} from '@angular/material';
import { Router} from '@angular/router';

@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.css']
})
export class BlockListComponent implements OnInit {

  status: any; // basically latest block and some data

  blocks : any = [];

  count : number;
  page : number = 0;

  pageEvent: PageEvent;

  next : string;
  prev : string;

  displayedColumns: string[] = ['height', 'hash', 'age', 'difficulty', 'inputs', 'outputs', 'kernels', 'actions'];

  loading_status: boolean = false;
  loading_blocks: boolean = false;
  loading_charts: boolean = false;

  constructor(private dataService: DataService, private router: Router) {

  }

  public loadBlocks(event?:PageEvent){

    this.loading_blocks = true;
    this.page = event ? event.pageIndex : 0;
    
    console.log('loadBlocks, page=', this.page);
    this.dataService.loadBlocks(this.page).subscribe((data) => {
      this.loading_blocks = false;
      console.log('Blocks',data);

      this.blocks = data['results'];
      this.count = data['count'];
      this.prev = data['prev'];
      this.next = data['next'];
     });
    
    return event;
  }

  public onChartsLoaded(chartsStatus: boolean) {
    if (chartsStatus){
        this.loading_charts = false;
    }
  }

  public showCharts() {
      this.router.navigate(
          ['/charts', this.status.height]
      );
  }

  public showBlockDetails(hash) {
      this.router.navigate(
          ['/block', hash]
      );
  }

  ngOnInit() {
    this.loading_status = true;
    this.loading_charts = true;

    this.dataService.loadStatus().subscribe((status) => {
      console.log('Status', status);
      this.status = status;
      this.loading_status = false;
    });

    this.loadBlocks(null);
  }

}

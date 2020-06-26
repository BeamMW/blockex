import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../services';
import { ChartsComponentDesktop } from '../charts-component/charts-component.component.desktop';
import { routesConsts } from '../consts';

import { MatTableDataSource } from '@angular/material';
import { PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-block-list-desktop',
  templateUrl: './block-list.component.desktop.html',
  styleUrls: ['./block-list.component.desktop.css'],
})
export class BlockListComponentDesktop implements OnInit {
  @ViewChild(ChartsComponentDesktop) child: ChartsComponentDesktop;

  isMainnet: boolean = false;
  status : any; // basically latest block and some data
  lastHeight : number;
  //pageSizeOptions: number[] = [20, 50, 100];

  blocks: any;
  dataSource: any;
  updatesCounter: number = 0;
  loadedWithError: boolean = false;
  isEnvUpdating: boolean = false;

  count: number;
  page: number = 0;

  pageEvent: PageEvent;

  next: string;
  prev: string;

  displayedColumns: string[] = ['height', 'hash', 'age',
      'difficulty', 'kernels', 'inputs', 'outputs', 'fees'];

  loading_status: boolean = false;
  loading_blocks: boolean = false;
  loading_charts: boolean = false;

  constructor(private dataService: DataService, private router: Router) {}

  public loadBlocks(event?:PageEvent){

    this.loading_blocks = true;
    this.page = event ? event.pageIndex : 0;

    this.dataService.loadBlocks(this.page).subscribe((data) => {
      this.loading_blocks = false;

      this.blocks = data['results'];
      this.dataSource = new MatTableDataSource(this.blocks);

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
    /*this.router.navigate(
      [routesConsts.CHARTS, this.status.height]
    );*/
  }

  public showBlockDetails(block) {
    this.router.navigate(
      [routesConsts.BLOCK_DETAILS, block.hash]
    );
  }

  ngOnInit() {
    this.isMainnet = environment.production;
    this.loading_status = true;
    this.loading_charts = true;
    this.isEnvUpdating = environment.updating;

    this.dataService.loadStatus().subscribe((status) => {
      this.status = status;
      this.lastHeight = status.height;
      this.loading_status = false;
    }, (error) => {
      this.loadedWithError = true;
    });

    this.loadBlocks(null);
  }

}

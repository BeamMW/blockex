import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../services';
import { ChartsComponent } from '../charts-component/charts-component.component';
import { blockListConsts } from '../consts';

import {MatPaginator, MatTableDataSource} from '@angular/material';
import {PageEvent} from '@angular/material';
import { Router} from '@angular/router';

@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.css']
})
export class BlockListComponent implements OnInit {
  @ViewChild(ChartsComponent) child: ChartsComponent;

  status : any; // basically latest block and some data
  lastHeight : number;

  blocks : any;
  dataSource : any;
  updatesCounter : number = 0;

  count : number;
  page : number = 0;

  pageEvent: PageEvent;

  next : string;
  prev : string;

  displayedColumns : string[] = ['height', 'hash', 'age',
      'difficulty', 'inputs', 'outputs', 'kernels', 'actions'];

  loading_status : boolean = false;
  loading_blocks : boolean = false;
  loading_charts : boolean = false;

  constructor(private dataService: DataService, private router: Router) {}

  public loadBlocks(event?:PageEvent){

    this.loading_blocks = true;
    this.page = event ? event.pageIndex : 0;
    
    console.log('loadBlocks, page=', this.page);
    this.dataService.loadBlocks(this.page).subscribe((data) => {
      this.loading_blocks = false;
      console.log('Blocks',data);

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
    this.router.navigate(
      ['/charts', this.status.height]
    );
  }

  public showBlockDetails(hash) {
    this.router.navigate(
      ['/block', hash]
    );
  }

  public updateBlocks(){
    this.dataService.loadStatus().subscribe((status) => {
      if (this.lastHeight < status.height){
        this.updatesCounter++;

        this.dataService.loadBlocksRange(this.lastHeight + 1, status.height, true).subscribe((blocksToAdd) => {
          blocksToAdd.reverse();

          if (blocksToAdd.length > blockListConsts.MAX_TABLE_SIZE) {
            this.blocks = [];
            this.blocks.push(blocksToAdd.slice(0, blockListConsts.MAX_TABLE_SIZE));
          } else if (this.blocks.length === blockListConsts.MAX_TABLE_SIZE) {
            this.blocks.splice(this.blocks.length - blocksToAdd.length, blocksToAdd.length);
          }
          this.blocks.unshift(...blocksToAdd);

          this.lastHeight = status.height;
          this.status = status;
          this.dataSource._updateChangeSubscription()
        });

        //trigger charts update
        if (this.updatesCounter === blockListConsts.MINUTES_IN_HOUR){
          this.updatesCounter = 0;
          this.child.updateCharts(status.height);
        }
      }
    })
  }

  ngOnInit() {
    setInterval(() => this.updateBlocks(), 60000);
    this.loading_status = true;
    this.loading_charts = true;

    this.dataService.loadStatus().subscribe((status) => {
      console.log('Status', status);
      this.status = status;
      this.lastHeight = status.height;
      this.loading_status = false;
    });

    this.loadBlocks(null);
  }

}

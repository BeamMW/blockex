import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from './../../../../../environments/environment';
import { routesConsts } from '../../../../consts';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '../../../../services/data/data.service';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {
  public selectorTitles = {
    BLOCKS: 'BLOCKS',
    AS_OFFERS: 'ATOMIC SWAP OFFERS',
  };

  public displayedColumns: string[] = ['height', 'hash', 'age',
    'difficulty', 'kernels', 'inputs', 'outputs', 'fees'];
  public dataSource = ELEMENT_DATA;
  public selectorActiveTitle = this.selectorTitles.BLOCKS;

  public blocksCount: number;
  public blocksPage: number;
  public blocksData: any;
  public loadingBlocks = false;
  private subscriber: any;

  constructor(
    private dataService: DataService,
    private router: Router) { }

  ngOnInit(): void {
    this.subscriber = this.dataService.height.subscribe((value) => {
      this.loadBlocks(null);
    });
  }

  ngOnDestroy(): void {
    this.subscriber.unsubscribe();
  }

  public showBlockDetails(block) {
    this.router.navigate(
      [routesConsts.BLOCK_DETAILS, block.hash]
    );
  }

  public loadBlocks(event?: PageEvent){
    this.loadingBlocks = true;
    this.blocksPage = event ? event.pageIndex : 0;

    this.dataService.loadBlocks(this.blocksPage).subscribe((data) => {
      this.loadingBlocks = false;
      this.blocksData = new MatTableDataSource(data['results']);
      this.blocksCount = data['count'];
    });

    return event;
  }

  downloadsClicked(): void {
    if (environment.envTitle === routesConsts.TESTNET_TITLE) {
      window.open(routesConsts.WALLET_TESTNET_DONWLOAD, '_blank');
    } else if (environment.envTitle === routesConsts.BEAMX_TITLE) {
      window.open(routesConsts.WALLET_BEAMX_DOWNLOAD, '_blank');
    } else {
      window.open(routesConsts.WALLET_MAINNET_DOWNLOAD, '_blank');
    }
  }

  selectorItemBlocksClicked(): void {
    if (this.selectorActiveTitle !== this.selectorTitles.BLOCKS) {
      this.selectorActiveTitle = this.selectorTitles.BLOCKS;
    }
  }

  selectorItemASOClicked(): void {
    if (this.selectorActiveTitle !== this.selectorTitles.AS_OFFERS) {
      this.selectorActiveTitle = this.selectorTitles.AS_OFFERS;
    }
  }
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];
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

  public displayedOffersColumns: string[] = [
    'coins', 'amount-send', 'amount-rec', 'created', 'expired', 'tr-id'
  ]
  public displayedColumns: string[] = ['height', 'hash', 'age',
    'difficulty', 'kernels', 'inputs', 'outputs', 'fees'];
  public dataSource = ELEMENT_DATA;
  public selectorActiveTitle = this.selectorTitles.BLOCKS;

  public blocksCount: number;
  public blocksPage: number = 0;
  public blocksData: any;
  public offersCount: number;
  public offersPage: number = 0;
  public offersData: any;
  private subscriber: any;

  constructor(
    private dataService: DataService,
    private router: Router) { }

  ngOnInit(): void {
    this.subscriber = this.dataService.height.subscribe((value) => {
      if (this.selectorActiveTitle === this.selectorTitles.BLOCKS) {
        this.loadBlocks({
          pageIndex: this.blocksPage
        });
      } else {
        this.loadOffers({
          pageIndex: this.offersPage
        })
      }
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

  loadBlocks(event?){
    this.blocksPage = event ? event.pageIndex : 0;

    this.dataService.loadBlocks(this.blocksPage).subscribe((data) => {
      this.blocksData = new MatTableDataSource(data['results']);
      this.blocksCount = data['count'];
    });

    return event;
  }

  loadOffers(event?){
    this.offersPage = event ? event.pageIndex : 0;

    this.dataService.loadOffers(this.offersPage).subscribe((data) => {
      this.offersData = new MatTableDataSource(data['offers']);
      this.offersCount = 100;
      //this.offersCount = data['count'];
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
      this.loadBlocks(null);
    }
  }

  selectorItemASOClicked(): void {
    if (this.selectorActiveTitle !== this.selectorTitles.AS_OFFERS) {
      this.selectorActiveTitle = this.selectorTitles.AS_OFFERS;
      this.loadOffers(null);
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
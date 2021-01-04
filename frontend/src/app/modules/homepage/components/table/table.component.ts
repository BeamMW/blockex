import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { environment } from './../../../../../environments/environment';
import { routesConsts } from '../../../../consts';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '../../../../services/data/data.service';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {
  @HostListener('document:click', ['$event']) clickout(event: any) {
    this.isSelectedOfferVisible = false;
  }

  public icons = {
    BTC: {
      value: 'BTC',
      iconUrl: `../../../../../assets/modules/homepage/components/table/icon-btc.svg`
    },
    LTC: {
      value: 'LTC',
      iconUrl: `../../../../../assets/modules/homepage/components/table/icon-ltc.svg`
    },
    BCH: {
      value: 'BCH',
      iconUrl: `../../../../../assets/modules/homepage/components/table/icon-bch.svg`
    },
    DASH: {
      value: 'DASH',
      iconUrl: `../../../../../assets/modules/homepage/components/table/icon-dash.svg`
    },
    DOGE: {
      value: 'DOGE',
      iconUrl: `../../../../../assets/modules/homepage/components/table/icon-doge.svg`
    },
    QTUM: {
      value: 'QTUM',
      iconUrl: `../../../../../assets/modules/homepage/components/table/icon-qtum.svg`
    }
  }
  public iconBeamUrl: string = `../../../../../assets/modules/homepage/components/table/icon-beam.svg`;
  public iconArrowDownUrl: string = `../../../../../assets/modules/homepage/components/table/arrow-down.svg`;

  public selectorTitles = {
    BLOCKS: 'BLOCKS',
    AS_OFFERS: 'ATOMIC SWAP OFFERS',
  };

  public displayedOffersColumns: string[] = [
    'coins', 'amount-send', 'amount-rec', 'created', 'expired', 'tr-id'
  ]
  public displayedColumns: string[] = ['height', 'hash', 'age',
    'difficulty', 'kernels', 'inputs', 'outputs', 'fees'];
  public selectorActiveTitle = this.selectorTitles.BLOCKS;
  public isMobile = this.deviceService.isMobile();

  public offerFilters = [{
    name: 'All',
    isSelected: true,
    value: 'all',
    active: true
  }, {
    name: 'BTC (Bitcoin)',
    isSelected: false,
    value: 'BTC',
    active: false
  }, {
    name: 'BCH (Bitcoin Cash)',
    isSelected: false,
    value: 'BCH',
    active: false
  }, {
    name: 'BSV (Bitcoin SV)',
    isSelected: false,
    value: 'BSV',
    active: false
  }, {
    name: 'LTC (Litecoin)',
    isSelected: false,
    value: 'LTC',
    active: false
  }, {
    name: 'DASH (Dash)',
    isSelected: false,
    value: 'DASH',
    active: false
  }, {
    name: 'QTUM (Qtum)',
    isSelected: false,
    value: 'QTUM',
    active: false
  }, {
    name: 'DOGE (Dogecoin)',
    isSelected: false,
    value: 'BTC',
    active: false
  }];
  public selectedOfferFilter = this.offerFilters[0];
  public isSelectedOfferVisible = false;

  public blocksCount: number;
  public blocksPage: number = 0;
  public blocksData: any;
  public offersCount: number;
  public offersPage: number = 0;
  public offersData: any;
  public offersLoadInProgress = false;
  private subscriber: any;

  constructor(
    private deviceService: DeviceDetectorService,
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
    this.offersLoadInProgress = true;
    this.offersPage = event ? event.pageIndex : 0;

    this.dataService.loadOffers(this.offersPage).subscribe((data) => {
      this.offerFilters.forEach((item) => {
        if (item !== this.offerFilters[0]) {
          item.active = false;
        }
      });
      data['offers'].map(element => {
        let createdDate = new Date(element.time_created.replaceAll('.', '-').replace(' ', 'T')+'Z');
        const heightDiffInHours = (element.height_expired - element.min_height) / 60;
        element.time_created = createdDate.toUTCString();
        element['expired_time'] = createdDate.setHours(createdDate.getHours() + Math.round(heightDiffInHours));
        
        const filterItem = this.offerFilters.find((item) => {
          return item.value === element.swap_currency;
        });

        if (filterItem !== undefined) {
          filterItem.active = true;
        }

        return element;
      });
      this.offersData = new MatTableDataSource(data['offers']);
      if (this.selectedOfferFilter !== this.offerFilters[0]) {
        this.offersData.filter = this.selectedOfferFilter.value;
      } else {
        this.offersData.filter = '';
      }
      this.offersCount = data['count'];
      this.offersLoadInProgress = false;
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

  getSecondCurrencyIcon(currValue) {
    if (currValue === this.icons.BTC.value) {
      return this.icons.BTC.iconUrl;
    } else if (currValue === this.icons.BCH.value) {
      return this.icons.BCH.iconUrl;
    } else if (currValue === this.icons.DASH.value) {
      return this.icons.DASH.iconUrl;
    } else if (currValue === this.icons.DOGE.value) {
      return this.icons.DOGE.iconUrl;
    } else if (currValue === this.icons.LTC.value) {
      return this.icons.LTC.iconUrl;
    } else if (currValue === this.icons.QTUM.value) {
      return this.icons.QTUM.iconUrl;
    }
  }

  offersFilterClicked(item) {
    if (this.selectedOfferFilter !== item) {
      this.selectedOfferFilter.isSelected = false;
      this.selectedOfferFilter = item;
      this.selectedOfferFilter.isSelected = true;
      if (this.selectedOfferFilter !== this.offerFilters[0]) {
        this.offersData.filter = item.value;
      } else {
        this.offersData.filter = '';
      }
    }
  }

  showOffersOptions(event) {
    event.stopPropagation();
    this.isSelectedOfferVisible = !this.isSelectedOfferVisible;
  }
}
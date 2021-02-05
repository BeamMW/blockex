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
    },
    WBTC: {
      value: 'WBTC',
      iconUrl: `../../../../../assets/modules/homepage/components/table/icon-wbtc.svg`
    },
    USDT: {
      value: 'USDT',
      iconUrl: `../../../../../assets/modules/homepage/components/table/icon-usdt.svg`
    },
    ETH: {
      value: 'ETH',
      iconUrl: `../../../../../assets/modules/homepage/components/table/icon-eth.svg`
    },
    DAI: {
      value: 'DAI',
      iconUrl: `../../../../../assets/modules/homepage/components/table/icon-dai.svg`
    }
  }
  public iconBeamUrl: string = `../../../../../assets/modules/homepage/components/table/icon-beam.svg`;
  public iconArrowDownUrl: string = `../../../../../assets/modules/homepage/components/table/arrow-down.svg`;

  public selectorTitles = {
    BLOCKS: 'BLOCKS',
    AS_OFFERS: 'ATOMIC SWAP OFFERS',
  };

  public displayedOffersColumns: string[] = [
    'coins', 'amount-send', 'amount-rec', 'rate', 'created', 'expired', 'tr-id'
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
    name: 'DAI (Dai)',
    isSelected: false,
    value: 'DAI',
    active: false
  }, {
    name: 'WBTC (Wrapped Bitcoin)',
    isSelected: false,
    value: 'WBTC',
    active: false
  }, {
    name: 'ETH (Ethereum)',
    isSelected: false,
    value: 'ETH',
    active: false
  }, {
    name: 'USDT (Tether)',
    isSelected: false,
    value: 'USDT',
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
    this.loadOffers(null);
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
      this.offersData.filterPredicate = function(data: any, filterValue: string) {
        return data.swap_currency === filterValue;
      };
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

  getCurrencyIcon(val) {
    if (val === this.icons.BTC.value) {
      return this.icons.BTC.iconUrl;
    } else if (val === this.icons.BCH.value) {
      return this.icons.BCH.iconUrl;
    } else if (val === this.icons.DASH.value) {
      return this.icons.DASH.iconUrl;
    } else if (val === this.icons.DOGE.value) {
      return this.icons.DOGE.iconUrl;
    } else if (val === this.icons.LTC.value) {
      return this.icons.LTC.iconUrl;
    } else if (val === this.icons.QTUM.value) {
      return this.icons.QTUM.iconUrl;
    } else if (val === this.icons.WBTC.value) {
      return this.icons.WBTC.iconUrl;
    } else if (val === this.icons.ETH.value) {
      return this.icons.ETH.iconUrl;
    } else if (val === this.icons.USDT.value) {
      return this.icons.USDT.iconUrl;
    } else if (val === this.icons.DAI.value) {
      return this.icons.DAI.iconUrl;
    }
  }

  getFirstCurrencyIcon(elem) {
    if (elem.is_beam_side) {
      return this.iconBeamUrl;
    } else {
      return this.getCurrencyIcon(elem.swap_currency);
    }
  }

  getSecondCurrencyIcon(elem) {
    if (elem.is_beam_side) {
      return this.getCurrencyIcon(elem.swap_currency);
    } else {
      return this.iconBeamUrl;
    }
  }

  getCurrencyTitle(elem) {
    if (!elem.is_beam_side) {
      return elem.swap_currency+'/BEAM';
    } else {
      return 'BEAM/'+elem.swap_currency;
    }
  }

  getSendAmount(elem) {
    if (elem.is_beam_side) {
      return elem.beam_amount;
    } else {
      return elem.swap_amount;
    }
  }

  getReceiveAmount(elem) {
    if (elem.is_beam_side) {
      return elem.swap_amount;
    } else {
      return elem.beam_amount;
    }
  }

  getSendCurr(elem) {
    if (elem.is_beam_side) {
      return 'BEAM';
    } else {
      return elem.swap_currency;
    }
  }

  getReceiveCurr(elem) {
    if (elem.is_beam_side) {
      return elem.swap_currency;
    } else {
      return 'BEAM';
    }
  }

  getRate(elem) {
    return elem.swap_amount / elem.beam_amount;
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
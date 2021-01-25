import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, EventEmitter, Output, OnInit, AfterContentInit } from '@angular/core';
import { from, Observable } from 'rxjs';
import { WebsocketService } from '../../../../modules/websocket';
import { WS } from '../../../../websocket.events';
import { DataService } from '../../../../services/data/data.service';
import { currencies } from '../../../../consts'
import { DeviceDetectorService } from 'ngx-device-detector';

export interface IStatus {
  height: number;
  difficulty: number;
  timestamp: string;
  dateFormatted: number;
  coins_in_circulation_mined: number;
  coins_in_circulation_treasury: string;
  total_coins_in_circulation: number;
  next_treasury_emission_block_height: string;
  next_treasury_emission_coin_amount: string;
  total_emission: string;
  swaps_stats_btc: {
    bitcoin: number,
    dash: number,
    dogecoin: number,
    litecoin: number,
    qtum: number
  };
  swaps_stats_usd: {
    bitcoin: number,
    dash: number,
    dogecoin: number,
    litecoin: number,
    qtum: number
  };
  swaps_stats_sum_btc: number,
  swaps_stats_sum_usd: number;
}

export interface MostOfferingItem {
  title: string;
  value: number;
}

@Component({
  selector: 'app-status-cards',
  templateUrl: './status-cards.component.html',
  styleUrls: ['./status-cards.component.scss']
})
export class StatusCardsComponent implements OnInit, OnDestroy, AfterContentInit {
  @Output() changeStatsCurrency = new EventEmitter<string>();

  public statusData$: Observable<IStatus>;
  public mostOffering: MostOfferingItem[];
  private lastHeight: number;
  private subWs: any;
  private subStatus: any;
  public isVolumesSelectVisible = false;
  public offers: MostOfferingItem[];
  public switcherValues = {
    BTC: currencies.BTC,
    USD: currencies.USD
  }
  public isSwitcherVisible = false;
  public switcherSelectedValue: string = this.switcherValues.USD;
  private lastStatusData: IStatus;
  public isMobile = this.deviceService.isMobile();
  public componentParams = {
    isBlockCardExpanded: false,
    isTreasuryCardExpanded: false,
    isEmissionCardExpanded: false,
    isOffersCardExpanded: false
  }

  constructor(
    private wsService: WebsocketService,
    private dataService: DataService,
    private deviceService: DeviceDetectorService
  ) {

    this.subWs = this.wsService.publicStatus.subscribe((isConnected) => {
      if (isConnected) {
        this.wsService.send(WS.INIT.INIT_STATUS);
      }
    });
    this.statusData$ = this.wsService.on<IStatus>(WS.INIT.INIT_STATUS, WS.UPDATE.UPDATE_STATUS);
  }

  loadOffersStats(data) {
    this.offers = [];
    this.offers.push({title: 'BTC', value: data.bitcoin});
    this.offers.push({title: 'DASH', value: data.dash});
    this.offers.push({title: 'DOGE', value: data.dogecoin});
    this.offers.push({title: 'LTC', value: data.litecoin});
    this.offers.push({title: 'QTUM', value: data.qtum});
    this.offers.push({title: 'WBTC', value: data.wbtc});
    this.offers.push({title: 'ETH', value: data.eth});
    this.offers.push({title: 'USDT', value: data.usdt});
    this.offers.push({title: 'DAI', value: data.dai});

    this.offers.sort((a, b) => {
      return b.value - a.value;
    });
    this.mostOffering = this.offers.slice(0, 3);
  }

  ngOnInit(): void {
    this.subStatus = this.statusData$.subscribe((data) => {
      this.lastStatusData = data;
      data.dateFormatted = new Date(data.timestamp.replace(' ', 'T')).getTime();
      if (this.switcherSelectedValue === this.switcherValues.USD) {
        this.loadOffersStats(data.swaps_stats_usd);
      } else if (this.switcherSelectedValue === this.switcherValues.BTC) {
        this.loadOffersStats(data.swaps_stats_btc);
      }
      
      if (this.lastHeight === undefined || data.height > this.lastHeight) {
        this.dataService.height.next(data.height);
        this.lastHeight = data.height;
      }
    });
  }

  ngOnDestroy(): void {
    this.subWs.unsubscribe();
    this.subStatus.unsubscribe();
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.isSwitcherVisible = true;
    }, 1000);
  }

  volumesClicked() {
    this.isVolumesSelectVisible = !this.isVolumesSelectVisible;
  }

  switcherClicked = (event, value: string) => {
    event.stopPropagation();
    this.switcherSelectedValue = value;
    if (value === this.switcherValues.USD) {
      this.changeStatsCurrency.emit(currencies.USD);
      this.loadOffersStats(this.lastStatusData.swaps_stats_usd);
    } else if (value === this.switcherValues.BTC) {
      this.changeStatsCurrency.emit(currencies.BTC);
      this.loadOffersStats(this.lastStatusData.swaps_stats_btc);
    }
  }

  blockCardControlClicked() {
    this.componentParams.isBlockCardExpanded = !this.componentParams.isBlockCardExpanded;
  }

  treasuryCardControlClicked() {
    this.componentParams.isTreasuryCardExpanded = !this.componentParams.isTreasuryCardExpanded;
  }

  emissionCardControlClicked() {
    this.componentParams.isEmissionCardExpanded = !this.componentParams.isEmissionCardExpanded;
  }

  offersCardControlClicked() {
    this.componentParams.isOffersCardExpanded = !this.componentParams.isOffersCardExpanded;
  }
}

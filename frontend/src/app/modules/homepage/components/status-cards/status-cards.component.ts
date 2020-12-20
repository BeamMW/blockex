import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, OnInit, AfterContentInit } from '@angular/core';
import { from, Observable } from 'rxjs';
import { WebsocketService } from '../../../../modules/websocket';
import { WS } from '../../../../websocket.events';
import { DataService } from '../../../../services/data/data.service';

export interface IStatus {
  height: number;
  difficulty: number;
  timestamp: string;
  coins_in_circulation_mined: number;
  coins_in_circulation_treasury: string;
  total_coins_in_circulation: number;
  next_treasury_emission_block_height: string;
  next_treasury_emission_coin_amount: string;
  total_emission: string;
  swap_totals: {
    beams_offered: number,
    bitcoin_offered: number,
    dash_offered: number,
    dogecoin_offered: number,
    litecoin_offered: number,
    qtum_offered: number,
    total_swaps_count: number
  };
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
  public statusData$: Observable<IStatus>;
  public mostOffering: MostOfferingItem[];
  private lastHeight: number;
  private subWs: any;
  private subStatus: any;
  public isVolumesSelectVisible = false;
  public offers: MostOfferingItem[];
  public switcherValues = {
    BTC: 'btc',
    USD: 'usd'
  }
  public isSwitcherVisible = false;
  public switcherSelectedValue: string = this.switcherValues.USD;

  constructor(
    private wsService: WebsocketService,
    private dataService: DataService
  ) {

    this.subWs = this.wsService.publicStatus.subscribe((isConnected) => {
      if (isConnected) {
        this.wsService.send(WS.INIT.INIT_STATUS);
      }
    });
    this.statusData$ = this.wsService.on<IStatus>(WS.INIT.INIT_STATUS, WS.UPDATE.UPDATE_STATUS);
  }

  ngOnInit(): void {
    this.subStatus = this.statusData$.subscribe((data) => {
      this.offers = [];
      this.offers.push({title: 'BTC', value: data.swap_totals.bitcoin_offered});
      this.offers.push({title: 'DASH', value: data.swap_totals.dash_offered});
      this.offers.push({title: 'DOGE', value: data.swap_totals.dogecoin_offered});
      this.offers.push({title: 'LTC', value: data.swap_totals.litecoin_offered});
      this.offers.push({title: 'QTUM', value: data.swap_totals.qtum_offered});

      this.offers.sort((a, b) => {
        return b.value - a.value;
      });
      this.mostOffering = this.offers.slice(0, 3);

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

  switcherClicked = (value: string) => {
    this.switcherSelectedValue = value;
    if (value === this.switcherValues.USD) {
      
    } else if (value === this.switcherValues.BTC) {
    }
  }
}

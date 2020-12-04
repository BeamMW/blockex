import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { from, Observable } from 'rxjs';
import { WebsocketService } from '../../../../modules/websocket';
import { DataService } from '../../../../services/data/data.service';
import { WS } from '../../../../websocket.events';

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
export class StatusCardsComponent implements AfterViewInit {
  public statusData$: Observable<IStatus>;
  public mostOffering: MostOfferingItem[];

  constructor(private wsService: WebsocketService, private dataService: DataService) {
    this.wsService.status.subscribe((isConnected) => {
      if (isConnected) {
        this.wsService.send(WS.INIT.INIT_STATUS);
      }
    });
    this.statusData$ = this.wsService.on<IStatus>(WS.INIT.INIT_STATUS, WS.UPDATE.UPDATE_STATUS);
  }

  ngAfterViewInit(): void {
    this.statusData$.subscribe((data) => {
      const topOffersSelector: MostOfferingItem[] = [];
      topOffersSelector.push({title: 'BTC', value: data.swap_totals.bitcoin_offered});
      topOffersSelector.push({title: 'DASH', value: data.swap_totals.dash_offered});
      topOffersSelector.push({title: 'DOGE', value: data.swap_totals.dogecoin_offered});
      topOffersSelector.push({title: 'LTC', value: data.swap_totals.litecoin_offered});
      topOffersSelector.push({title: 'QTUM', value: data.swap_totals.qtum_offered});

      topOffersSelector.sort((a, b) => {
        return b.value - a.value;
      });
      this.mostOffering = topOffersSelector.slice(0, 3);
    });


    this.dataService.loadBlocks(1).subscribe((data) => {
      console.log(data);
    });
  }
}

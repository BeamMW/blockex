import { Component, OnInit, AfterViewInit } from '@angular/core';
import { WebsocketService } from '../../../../modules/websocket';
import { WS } from '../../../../websocket.events';
import { Observable } from 'rxjs';

export interface IGraphs {
  data: string;
}

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements OnInit {
  public statusData$: Observable<IGraphs>;

  constructor(private wsService: WebsocketService) {
    this.wsService.status.subscribe((isConnected) => {
      if (isConnected) {
        this.wsService.send(WS.INIT.INIT_GRAPHS);
      }
    });
    this.statusData$ = this.wsService.on<IGraphs>(WS.INIT.INIT_GRAPHS, WS.UPDATE.UPDATE_STATUS);
  }

  ngOnInit(): void {
  }

}

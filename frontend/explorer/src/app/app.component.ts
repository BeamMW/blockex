import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { map, tap, catchError, retry } from 'rxjs/operators';
import { DataService } from './services/data/data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'explorer';

  // transactions$ = this.service.messages$.pipe(
  //   map(rows => rows['data']),
  //   catchError(error => { throw error }),
  //   tap({
  //     error: error => console.log('[Live Table component] Error:', error),
  //     complete: () => console.log('[Live Table component] Connection Closed')
  //   })
  // );

  constructor(private service: DataService) {
    // this.service.connect({reconnect : true});
    // this.service.sendMessage({message: 'init'});




    // const socket = new WebSocket("ws://127.0.0.1:8000/ws/explorer/");
    // socket.onopen = () => {
    //   // socket.onmessage = (event) => {
    //   //     console.log(event);
    //   // };


    //   // socket.send(JSON.stringify({message: "hello"}));
    // };

    // socket.onmessage = () => {

    // };

    // socket.onclose = () => {
    //   console.error('Socket connection closed');
    // };

  }

  ngAfterViewInit(): void {}
}

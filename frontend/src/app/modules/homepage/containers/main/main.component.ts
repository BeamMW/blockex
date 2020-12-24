import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  activeCurrency: string;
  public isMobile = this.deviceService.isMobile();
  constructor(private deviceService: DeviceDetectorService) { }

  ngOnInit(): void {
  }


  onChangeStatsCurrency(value: string) {
    this.activeCurrency = value;
  }
}

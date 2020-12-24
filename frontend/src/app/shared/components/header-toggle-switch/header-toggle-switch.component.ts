import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routesConsts } from './../../../consts';
import { environment } from './../../../../environments/environment';
import { DeviceDetectorService } from 'ngx-device-detector';
import { env } from 'process';

@Component({
  selector: 'app-header-toggle-switch',
  templateUrl: './header-toggle-switch.component.html',
  styleUrls: ['./header-toggle-switch.component.scss']
})
export class HeaderToggleSwitchComponent implements AfterViewInit {
  public isMobile = this.deviceService.isMobile();
  selectedValue = environment.envTitle;
  routesConstsVal = routesConsts;

  constructor(private deviceService: DeviceDetectorService) { }

  ngAfterViewInit(): void {
  }

  switcherClicked = (value: string) => {
    this.selectedValue = value;
    let redirectTo = '';
    if (value === this.routesConstsVal.MAINNET_TITLE) {
      redirectTo = this.routesConstsVal.MAINNET_HOST;
    } else if (value === this.routesConstsVal.BEAMX_TITLE) {
      redirectTo = this.routesConstsVal.BEAMX_HOST;
    } else if (value === this.routesConstsVal.TESTNET_TITLE) {
      redirectTo = this.routesConstsVal.TESTNET_HOST;
    }
    window.location.href = window.location.protocol + '//' + (redirectTo);
  }
}

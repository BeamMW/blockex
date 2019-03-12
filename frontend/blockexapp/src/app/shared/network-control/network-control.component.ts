import { Component, OnInit } from '@angular/core';
import {routesConsts} from "../../consts";
import {environment} from "../../../environments/environment";
import {Router, NavigationEnd} from "@angular/router";

@Component({
  selector: 'app-network-control',
  templateUrl: './network-control.component.html',
  styleUrls: ['./network-control.component.css'],
})
export class NetworkControlComponent implements OnInit {
  placeholder: string;
  status: boolean = false;
  visible: boolean = false;
  isChecked: boolean = !environment.production;
  switchText: string = environment.production ? routesConsts.MAINNET_TITLE.toUpperCase()
    : routesConsts.TESTNET_TITLE.toUpperCase();
  isMainnet: boolean = false;
  networkHosts: {title: string; value: string}[] = [];

  constructor(private router: Router) {}

  changedSwitchPosition() {
    this.switchText = environment.production ? routesConsts.TESTNET_TITLE.toUpperCase()
      : routesConsts.MAINNET_TITLE.toUpperCase();
    window.location.href = window.location.protocol + '//' + (environment.production ? routesConsts.TESTNET_HOST
      : routesConsts.MAINNET_HOST);
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if(event instanceof NavigationEnd) {
        this.visible = this.router.url == routesConsts.HOME;
      }
    });
  }

}

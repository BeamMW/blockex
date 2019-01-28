import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {routesConsts} from "../../consts";

@Component({
  selector: 'app-network-control',
  templateUrl: './network-control.component.html',
  styleUrls: ['./network-control.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NetworkControlComponent implements OnInit {
  placeholder: string;
  networkHosts: {title: string; value: string}[] = [];

  constructor() { }

  OnChange(host) {
    window.location.href = window.location.protocol + '//' + host;
  }

  ngOnInit() {
    this.networkHosts.push({title: routesConsts.MAINNET_TITLE, value: routesConsts.MAINNET_HOST});
    this.networkHosts.push({title: routesConsts.TESTNET_TITLE, value: routesConsts.TESTNET_HOST});

    let hostName = this.networkHosts.find(item => item.value === window.location.hostname);
    this.placeholder = hostName !== undefined ? hostName.title : "Network";
  }

}

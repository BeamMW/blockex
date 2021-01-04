import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { DataService } from '../../../../services';
import { Router, NavigationEnd} from '@angular/router';
import { routesConsts } from "../../../../consts";
import {environment} from "../../../../../environments/environment";
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-block-details',
  templateUrl: './block-details.component.html',
  styleUrls: ['./block-details.component.scss']
})
export class BlockDetailsComponent implements OnInit {
  @ViewChild('kernel') public kernel: ElementRef;

  block: any;
  loading_block: boolean = false;
  notFound: boolean = false;
  isMainnet: boolean = false;
  searchedBy = '';
  isFadein = true;

  kernelsExpanded: boolean = false;

  displayedColumns: any = {
    kernels: ['fee', 'id', 'extra'],
    inputs: ['height', 'commitment', 'extra'],
    outputs: ['commitment', 'extra'],
    block: ['name', 'value']
  };
  public isMobile = this.deviceService.isMobile();

  constructor(
      private router: Router,
      private deviceService: DeviceDetectorService,
      private dataService: DataService, 
      private route: ActivatedRoute) {
    route.queryParams.subscribe(params => {
      if (params.searched_by !== undefined) {
        this.searchedBy = params.searched_by;
        this.isFadein = true;
        setTimeout(() => {
          this.isFadein = false;
        }, 5000);
        this.kernelsExpanded = true;
      }
      setTimeout(() => {
          let element = null;
          if(this.searchedBy.length > 0) {
            element = document.querySelector("[id='"+this.searchedBy+"']");
          }
          if (element) {
            element.scrollIntoView({behavior: 'smooth'});
          }
        }, 300)
    });
  }

  backToExplorer() {
      this.router.navigate(
          [routesConsts.HOME]
      );
  }

  loadDetails(blockItem) {
    this.block.header = 'Block ' + blockItem.height;
    this.block.data = [
      {name: 'FEE:', value: blockItem.fee, additional: blockItem.fee !== 0 ? 'Groth' : ''},
      {name: 'HASH:', value: blockItem.hash, additional: ''},
      {name: 'DIFFICULTY:', value: blockItem.difficulty.toLocaleString(), additional: ''},
      {name: 'SUBSIDY:', value: blockItem.subsidy.toLocaleString(), additional: 'Groth'},
      {name: 'CHAINWORK:', value: blockItem.chainwork, additional: ''},
      {name: 'AGE:', value: new Date(blockItem.timestamp).toLocaleDateString("en-US", {
        year: 'numeric', month: 'long',
        day: 'numeric', hour: 'numeric',
        minute: 'numeric', second: 'numeric' }), additional: ''}
    ];

    if (blockItem.rate_btc !== null && blockItem.rate_usd !== null) {
      this.block.data.push({
        name: 'EXCHANGE RATE', value: blockItem.rate_btc + ' BTC | ' + blockItem.rate_usd + ' USD', additional: ''
      });
    }

    this.block.inputs = blockItem.inputs;
    this.block.outputs = blockItem.outputs;
    this.block.kernels = blockItem.kernels;
    this.loading_block = false;


    setTimeout(() => {
      let element = null;
      if(this.searchedBy.length > 0) {
        element = document.querySelector("[id='"+this.searchedBy+"']");
      }
      if (element) {
        element.scrollIntoView({behavior: 'smooth'});
      }
    }, 300)
  }

  ngOnInit() {
    let searchedItem = this.route.snapshot.queryParamMap.get('searched_by');
    let kernel_id = this.route.snapshot.queryParamMap.get('kernel_id');
    if (kernel_id) {
      searchedItem = kernel_id;
      this.dataService.searchBlock(kernel_id).subscribe((blockItem) => {
        this.loadDetails(blockItem);
      });
    }
    if (searchedItem) {
      this.isFadein = true;
      this.searchedBy = searchedItem;
      setTimeout(() => {
        this.isFadein = false;
      }, 5000);
      this.kernelsExpanded = true;
    }

    this.loading_block = true;
    this.block = {
      header: '',
      data: [],
      inputs: [],
      outputs: [],
      kernels: []
    };
    this.route.params.subscribe( (params) => {
        this.dataService.loadBlock(params.hash).subscribe((blockItem) => {
          this.loadDetails(blockItem);
      });
    });
  }

}
